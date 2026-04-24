# Database Architecture Decision Record

This document outlines the rationale for selecting the database engine and infrastructure tier for the Release Guard platform.

## 1. Database Engine Selection

**Chosen Engine:** PostgreSQL

### Why PostgreSQL?
* **Codebase Alignment:** The `src/app.module.ts` TypeORM configuration is explicitly written to default to a `postgres` driver when the `DB_HOST` environment variable is provided. It automatically targets port `5432`.
* **Advanced Features:** PostgreSQL offers superior support for complex data types (like JSONB), which is highly beneficial for storing flexible CI/CD policy configurations and external integration data without requiring strict schema migrations for every minor change.
* **Enterprise Standard:** It is widely considered the most robust, open-source relational database, perfectly suited for a "production-grade" platform handling multi-tenant data isolation securely.

### Why not MySQL or SQL Server?
* **MySQL:** While perfectly capable, MySQL handles strict schema migrations and complex JSON querying slightly less gracefully than PostgreSQL. In the modern NestJS/TypeORM ecosystem, PostgreSQL is the prevailing standard.
* **SQL Server:** This is a proprietary Microsoft product. It comes with significant licensing costs and vendor lock-in that are entirely unnecessary for a modern, cloud-agnostic platform like Release Guard.

---

## 2. Infrastructure Tier Selection (Google Cloud SQL)

**Chosen Tier:** Sandbox (Initially)

### Why Sandbox?
* **Cost-Efficiency:** The "Sandbox" tier (2 vCPUs, 8 GB RAM) provides a fully functional, enterprise-grade PostgreSQL instance at a fraction of the cost of higher tiers. 
* **Adequate Power:** For the current phase of validating the architecture, connecting the Jira module, and verifying Cloud Run deployments, 8 GB of RAM is more than enough power for the NestJS backend to handle queries instantly.
* **Seamless Scalability:** Google Cloud SQL allows you to seamlessly upgrade an instance. There is no need to migrate data manually when it is time to scale.

### Why not Development or Production (Yet)?
* **Development (4 vCPUs, 32 GB RAM):** This tier is overpowered for the current validation and staging phase. It would incur unnecessary costs without providing a tangible benefit while the system has a low volume of traffic.
* **Production (8 vCPUs, 64 GB RAM, Multi-zone):** While Release Guard is intended to be a production-grade application, provisioning a highly-expensive High-Availability instance before actual enterprise users are actively relying on the system is an inefficient use of resources. The Sandbox instance can simply be edited and converted to a Multi-zone Production tier via the GCP console with a single click once real production traffic necessitates strict Service Level Agreements (SLAs).
