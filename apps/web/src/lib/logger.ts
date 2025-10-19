import { prisma } from '@/lib/prisma';
import { LogLevel } from '@prisma/client';

export interface LogContext {
  userId?: string;
  userEmail?: string;
  action?: string;
  assetId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export const ActivityAction = {
  QR_CREATED: 'QR_CREATED',
  QR_REGENERATED: 'QR_REGENERATED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  FILE_SYNCED: 'FILE_SYNCED',
  FILE_DELETION: 'FILE_DELETION',
  FILE_MISSING: 'FILE_MISSING',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  ERROR: 'ERROR',
} as const;

export type ActivityActionType = typeof ActivityAction[keyof typeof ActivityAction];

export interface ActivityLogContext {
  userEmail: string;
  action: ActivityActionType;
  description: string;
  level?: LogLevel;
  assetId?: string;
  metadata?: Record<string, any>;
}

// Core logging function
export async function logToDatabase(
  level: LogLevel,
  message: string,
  context: LogContext = {}
) {
  try {
    await prisma.log.create({
      data: {
        level,
        message,
        userId: context.userId,
        userEmail: context.userEmail,
        action: context.action,
        metadata: context.metadata ? JSON.parse(JSON.stringify(context.metadata)) : null,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });
  } catch (error) {
    // Fallback to console logging if database logging fails
    console.error('Failed to log to database:', error);
    console.log(`[${level}] ${message}`, context);
  }
}

async function logActivityToDatabase({
  userEmail,
  action,
  description,
  level = LogLevel.INFO,
  assetId,
  metadata,
}: ActivityLogContext) {
  try {
    await (prisma as any).activityLog.create({
      data: {
        userEmail,
        action,
        description,
        level,
        assetId: assetId || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}

// Logging functions for different levels
export async function logDebug(message: string, context?: LogContext) {
  await logToDatabase(LogLevel.DEBUG, message, context);
}

export async function logInfo(message: string, context?: LogContext) {
  await logToDatabase(LogLevel.INFO, message, context);
}

export async function logWarn(message: string, context?: LogContext) {
  await logToDatabase(LogLevel.WARN, message, context);
}

export async function logError(message: string, context?: LogContext) {
  await logToDatabase(LogLevel.ERROR, message, context);
}

export async function logFatal(message: string, context?: LogContext) {
  await logToDatabase(LogLevel.FATAL, message, context);
}

// Specific logging methods for common actions
export async function logQRGeneration(
  qrType: string,
  userEmail: string,
  metadata?: Record<string, any>
) {
  await logInfo(`QR code generated: ${qrType}`, {
    userEmail,
    action: 'QR_GENERATED',
    metadata: { qrType, ...metadata },
  });

  await logActivityToDatabase({
    userEmail,
    action: ActivityAction.QR_CREATED,
    description: `Generated ${qrType} QR code`,
    metadata: { qrType, ...metadata },
  });
}

export async function logFileUpload(
  fileName: string,
  fileSize: number,
  userEmail: string,
  qrCodeId?: string
) {
  await logInfo('File uploaded for QR generation', {
    userEmail,
    action: 'FILE_UPLOADED',
    metadata: { fileName, fileSize, qrCodeId },
  });

  await logActivityToDatabase({
    userEmail,
    action: ActivityAction.FILE_UPLOADED,
    description: `Uploaded ${fileName}`,
    metadata: { fileName, fileSize, qrCodeId },
  });
}

export async function logUserAction(
  action: string,
  userEmail: string,
  metadata?: Record<string, any>
) {
  await logInfo(`User action: ${action}`, {
    userEmail,
    action,
    metadata,
  });

  const localActivityAction = {
    QR_REGENERATED: ActivityAction.QR_REGENERATED,
    FILE_SYNCED: ActivityAction.FILE_SYNCED,
    FILE_DELETION: ActivityAction.FILE_DELETION,
    FILE_MISSING: ActivityAction.FILE_MISSING,
    TOKEN_REFRESH: ActivityAction.TOKEN_REFRESH,
  };

  let parsedAction: ActivityActionType | null = null;
  switch (action) {
    case 'QR_REGENERATED':
      parsedAction = localActivityAction.QR_REGENERATED;
      break;
    case 'FILE_SYNCED':
      parsedAction = localActivityAction.FILE_SYNCED;
      break;
    case 'FILE_DELETION':
      parsedAction = localActivityAction.FILE_DELETION;
      break;
    case 'FILE_MISSING':
      parsedAction = ActivityAction.FILE_MISSING;
      break;
    case 'TOKEN_REFRESH':
      parsedAction = ActivityAction.TOKEN_REFRESH;
      break;
    default:
      parsedAction = null;
  }

  if (parsedAction) {
    await logActivityToDatabase({
      userEmail,
      action: parsedAction,
      description: action,
      metadata,
    });
  }
}

export async function logAppError(
  error: Error,
  userEmail?: string,
  context?: Record<string, any>
) {
  await logError(`Error occurred: ${error.message}`, {
    userEmail,
    action: 'ERROR',
    metadata: {
      errorName: error.name,
      stack: error.stack,
      ...context,
    },
  });

  if (userEmail) {
    await logActivityToDatabase({
      userEmail,
      action: ActivityAction.ERROR,
      description: error.message,
      level: LogLevel.ERROR,
      metadata: {
        errorName: error.name,
        stack: error.stack,
        ...context,
      },
    });
  }
}

export async function logAssetStatus(
  userEmail: string,
  action: ActivityActionType,
  description: string,
  options: { assetId?: string; metadata?: Record<string, any>; level?: LogLevel } = {}
) {
  await logActivityToDatabase({
    userEmail,
    action,
    description,
    assetId: options.assetId,
    metadata: options.metadata,
    level: options.level,
  });
}

// Middleware helper to extract request context
export async function getRequestContext(request: Request): Promise<LogContext> {
  const userAgent = request.headers.get('user-agent') || undefined;
  const ipAddress = getClientIP(request);

  return {
    userAgent,
    ipAddress,
  };
}

// Helper function to get client IP (works with various proxy headers)
function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const clientIP = request.headers.get('x-client-ip');
  if (clientIP) {
    return clientIP;
  }

  return undefined;
}
