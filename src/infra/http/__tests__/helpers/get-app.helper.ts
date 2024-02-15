import applicationConfig from "@config/application";
import { edenTreaty } from "@elysiajs/eden";
import type { App as AppType } from "@infra/http/server";

const app = edenTreaty<AppType>(`http://localhost:${applicationConfig.port}`);

const getApp = () => app;

export default getApp;
