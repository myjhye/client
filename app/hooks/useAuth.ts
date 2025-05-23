/*
커스텀 훅(로그인, 로그아웃)
*/

import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";
import asyncStorage, { Keys } from "@utils/asyncStorage";
import client from "app/api/client";
import { runAxiosAsync } from "app/api/runAxiosAsync";
import { AuthStackParamList } from "app/navigator/AuthNavigator";
import { getAuthState, updateAuthState } from "app/store/auth";
import useClient from "hooks/useClient";
import { useDispatch, useSelector } from "react-redux";


// 1. 로그인 응답 타입 정의 (서버에서 돌아오는 데이터 구조)
export interface SignInRes {
    profile: {
        id: string;
        email: string;
        name: string;
        verified: boolean;
        avatar?: string;
    };
    tokens: {
        refresh: string;
        access: string;
    };
}


// 2. 사용자 입력 정보 타입 정의 (이메일, 비밀번호)
type UserInfo = {
    email: string;
    password: string;
};


// 3. 커스텀 훅 정의 시작 (useAuth)
export default function useAuth() {

    // 4. Redux의 dispatch, 현재 auth 상태 가져오기
    const { authClient } = useClient();
    const dispatch = useDispatch();
    const authState = useSelector(getAuthState);

    // 5. 로그인 함수 정의
    const signIn = async (userInfo: UserInfo) => {

        // 5-1. 로그인 시작 시 로딩 상태 true, 프로필 null로 초기화
        dispatch(updateAuthState({ 
            profile: null, 
            pending: true 
        }));

        // 시간 지연 (로딩 애니메이션 보이게)
        await new Promise((r) => setTimeout(r, 1500));

        // 5-2. 서버에 로그인 요청
        const res = await runAxiosAsync<SignInRes>(
            client.post("/auth/sign-in", userInfo)
        );

        console.log("signIn API response:", res);

        // 5-3. 응답이 있다면 (성공)
        if (res) {
            // 5-3-1. 토큰을 AsyncStorage에 저장
            await AsyncStorage.setItem("access-token", res.tokens.access);
            await AsyncStorage.setItem("refresh-token", res.tokens.refresh);
            
            // 5-3-2. Redux 상태에 사용자 프로필 저장, 로딩 상태 false로 전환
            dispatch(updateAuthState({ 
                profile: { 
                    ...res.profile, 
                    accessToken: res.tokens.access // ✅ 이 줄 추가!
                }, 
                pending: false 
            }));
            console.log("Login success, state updated");

            return true;
        } 

        // 5-4. 실패 시 로딩 false + 프로필 초기화
        else {
            dispatch(updateAuthState({ 
                profile: null, 
                pending: false 
            }));
            console.log("Login failed, res is null");

            return false;
        }
    }


    // 6. 로그아웃 함수 정의
    const signOut = async () => {
        // 6-1. 로딩 상태 표시
        dispatch(updateAuthState({ 
            profile: authState.profile,
            pending: true 
        }));

        try {
            // 6-2. 토큰 가져오기
            const token = await asyncStorage.get(Keys.REFRESH_TOKEN);
            
            if (token) {
                // 6-3. 서버에 로그아웃 요청
                await runAxiosAsync(
                    authClient.post("/auth/sign-out", { refreshToken: token })
                );
                
                // 6-4. 로컬 토큰 삭제
                await asyncStorage.remove(Keys.REFRESH_TOKEN);
                await asyncStorage.remove(Keys.AUTH_TOKEN);
            }
            
            // 6-5. Redux state 초기화 - 이게 핵심!
            dispatch(updateAuthState({ 
                profile: null, 
                pending: false 
            }));
            
        } catch (error) {
            console.error("로그아웃 에러:", error);
            // 에러가 발생해도 로그아웃 처리
            dispatch(updateAuthState({ 
                profile: null, 
                pending: false 
            }));
        }
    };


    // 7. 로그인 여부를 boolean으로 계산
    const loggedIn = authState.profile ? true : false;


    // 8. 외부에서 사용할 함수/상태 리턴
    return { signIn, signOut, authState, loggedIn };

}