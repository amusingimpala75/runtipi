/* eslint-disable import/no-extraneous-dependencies */
import 'graphql-import-node';
import { print } from 'graphql/language/printer';

import * as listAppInfos from './listAppInfos.graphql';
import * as getApp from './getApp.graphql';
import * as InstalledApps from './installedApps.graphql';

export const listAppInfosQuery = print(listAppInfos);
export const getAppQuery = print(getApp);
export const InstalledAppsQuery = print(InstalledApps);