import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('ReleaseGuard', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    // In real production, add a file transport or cloud logging transport here
  ],
});
