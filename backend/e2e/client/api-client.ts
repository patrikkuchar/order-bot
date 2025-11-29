import axios, { isAxiosError, type AxiosInstance } from "axios";
import {AuthApi, TemplateManagerApi, TestApi, Configuration} from "./generated";

const basePath = process.env.BACKEND_BASE_URL ?? "http://localhost:8080";

const makeHttpClient = (token?: string): AxiosInstance => {
    const instance = axios.create({
        baseURL: basePath
    });

    if (token) {
        instance.interceptors.request.use(config => {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            };
            return config;
        });
    }

    instance.interceptors.response.use(
        (res) => res,
        (error) => {
            if (isAxiosError(error)) {
                const method = error.config?.method?.toUpperCase();
                const url = error.config?.url ?? "";
                const absoluteUrl = error.config?.baseURL ? new URL(url, error.config.baseURL).toString() : url;
                const status = error.response?.status;
                const statusText = error.response?.statusText;

                const cleanError = new Error(
                    status
                        ? `HTTP ${status}${statusText ? ` ${statusText}` : ""} for ${method ?? "REQUEST"} ${absoluteUrl}`
                        : `Request failed for ${method ?? "REQUEST"} ${absoluteUrl}`
                );

                // Attach minimal context without non-cloneable functions
                (cleanError as any).status = status;
                (cleanError as any).data = error.response?.data;
                return Promise.reject(cleanError);
            }
            return Promise.reject(error);
        }
    );

    return instance;
}

type Api = {
    authApi: AuthApi,
    testApi: TestApi,
    templateManagerApi: TemplateManagerApi
}

const makeClient = (token?: string): Api => {
    const cfg = new Configuration({
        basePath,
        accessToken: token ? async () => token : undefined,
        isJsonMime: (mime: string) => !!mime && (/^(application\/json|.+\+json)$/i).test(mime)
    });
    const http = makeHttpClient(token);
    return {
        authApi: new AuthApi(cfg, basePath, http),
        testApi: new TestApi(cfg, basePath, http),
        templateManagerApi: new TemplateManagerApi(cfg, basePath, http)
    };
}

export const PublicApiClient = (): Api => {
    return makeClient();
}

export const PrivateApiClient = (token: string): Api => {
    return makeClient(token);
}
