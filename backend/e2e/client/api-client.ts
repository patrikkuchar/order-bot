import {AuthApi, type Configuration, TestApi} from "./generated";

const basePath = "http://localhost:8080";

type Api = {
    authApi: AuthApi,
    testApi: TestApi
}

const makeClient = (cfg?: Configuration): Api => {
    return {
        authApi: new AuthApi(cfg, basePath),
        testApi: new TestApi(cfg, basePath)
    };
}

export const PublicApiClient = (): Api => {
    return makeClient(undefined);
}

export const PrivateApiClient = (token: string): Api => {
    const cfg = {
        apiKey: { Authorization: `Bearer ${token}` },
        isJsonMime: (mime: string) => !!mime && (/^(application\/json|.+\+json)$/i).test(mime)
    } as any;
    return makeClient(cfg);
}