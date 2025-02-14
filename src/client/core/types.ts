import * as Router from '../../server/routers/_app';

export type { FormField, AppInfo } from '@/server/services/apps/apps.helpers';
export type { AppCategory } from '@/server/services/apps/apps.types';

export type App = Omit<Router.RouterOutput['app']['getApp'], 'info'>;
export type AppWithInfo = Router.RouterOutput['app']['getApp'];
