export * from './auth.service';
import { AuthApi } from './auth.service';
export * from './config.service';
import { ConfigApi } from './config.service';
export * from './test.service';
import { TestApi } from './test.service';
export const APIS = [AuthApi, ConfigApi, TestApi];
