import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  status: string;
  assignee: string;
  updated: string;
}

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchTickets(siteUrl: string, email: string, token: string): Promise<JiraTicket[]> {
    try {
      // Format credentials for Basic Auth
      const credentials = Buffer.from(`${email}:${token}`).toString('base64');
      
      // Ensure siteUrl has protocol and no trailing slash
      let baseUrl = siteUrl.trim().replace(/\/$/, '');
      if (!/^https?:\/\//i.test(baseUrl)) {
        baseUrl = `https://${baseUrl}`;
      }
      
      // JQL to fetch issues assigned to current user, ordered by recently updated
      const jql = encodeURIComponent('assignee=currentuser() order by updated DESC');
      const url = `${baseUrl}/rest/api/3/search?jql=${jql}&maxResults=10`;

      this.logger.debug(`Fetching Jira tickets from ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: 'application/json',
          },
        })
      );

      const issues = response.data.issues || [];
      
      return issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields?.summary || 'Unknown Summary',
        status: issue.fields?.status?.name || 'Unknown Status',
        assignee: issue.fields?.assignee?.displayName || 'Unassigned',
        updated: issue.fields?.updated || new Date().toISOString(),
      }));

    } catch (error) {
      this.logger.error(`Failed to fetch Jira tickets: ${error.message}`);
      if (error.response) {
        this.logger.error(`Jira API Response: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Failed to fetch Jira tickets. Please check your credentials and site URL. (${error.message})`);
    }
  }
}
