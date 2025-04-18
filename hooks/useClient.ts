import { baseURL } from "app/api/client";
import { getAuthState, updateAuthState } from "app/store/auth";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { runAxiosAsync } from "app/api/runAxiosAsync";
import asyncStorage, { Keys } from "@utils/asyncStorage";

// 1. 인증 요청용 Axios 인스턴스 생성
const authClient = axios.create({ baseURL });

// 2. 액세스/리프레시 토큰 응답 타입 정의
export type TokenResponse = {
    tokens: {
        refresh: string;
        access: string;
    };
};

// 3. 사용자 인증 클라이언트 훅 정의
const useClient = () => {

    // 4. Redux 상태에서 현재 인증 상태 가져오기
    const authState = useSelector(getAuthState);
    const dispatch = useDispatch();

    // 5. 현재 엑세스 토큰 추출
    const token = authState.profile?.accessToken;
    
    // 6. Axios 요청 인터셉터 설정 (요청 보낼 때 헤더에 Authorization 추가)
    authClient.interceptors.request.use(
        (config) => {
            if (!config.headers.Authorization) {
                config.headers.Authorization = "Bearer " + token; // Bearer 토큰 설정
            }

            return config;
        },
        (error) => {
            return Promise.reject(error); // 요청 에러 처리
        }
    );

    // 7. 액세스 토큰 만료 시 실행될 토큰 갱신 로직 정의
    const refreshAuthLogic = async (failedRequest: any) => {

        // 7-1. AsyncStorage에서 리프레시 토큰 가져오기
        const refreshToken = await asyncStorage.get(Keys.REFRESH_TOKEN);

        // 7-2. 리프레시 토큰으로 새 토큰 요청
        const options = {
            method: "POST",
            data: { refreshToken },
            url: `${baseURL}/auth/refresh-token`,
        };

        const res = await runAxiosAsync<TokenResponse>(axios(options));

        // 7-3. 응답에 새 토큰이 있다면
        if (res?.tokens) {
            // 7-4. 실패한 요청에 새 액세스 토큰으로 Authorization 헤더 갱신
            failedRequest.response.config.headers.Authorization = "Bearer " + res.tokens.access;

            // 7-5. 로그아웃 요청인 경우, 새 리프레시 토큰도 함께 전송
            if (failedRequest.response.config.url === "/auth/sign-out") {
                failedRequest.response.config.data = {
                    refreshToken: res.tokens.refresh,
                };
            }

            // 7-6. 새 토큰들을 AsyncStorage에 저장
            await asyncStorage.save(Keys.AUTH_TOKEN, res.tokens.access);
            await asyncStorage.save(Keys.REFRESH_TOKEN, res.tokens.refresh);

            // 7-7. Redux 상태 새로운 토큰으로 갱신
            dispatch(
                updateAuthState({
                    profile: { 
                        ...authState.profile!, 
                        accessToken: res.tokens.access 
                    },
                    pending: false,
                })
            );

            // 7-8. 갱신 성공 처리
            return Promise.resolve();
        }
    };

    // 8. 액세스 토큰 만료 시 위의 refreshAuthLogic 실행하도록 인터셉터 등록
    createAuthRefreshInterceptor(authClient, refreshAuthLogic);
    
    // 9. 인증용 Axios 인스턴스 반환
    return { authClient };

}

export default useClient;