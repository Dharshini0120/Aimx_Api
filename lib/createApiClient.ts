import axios from "axios";
import type { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import Router from "next/router";
import { refreshToken } from "../services/authservice";

export const createApiClient = (baseURL: string): AxiosInstance => {
	const apiClient = axios.create({
		baseURL,
		headers: {
			"Content-Type": "application/json",
		},
		withCredentials: true,
	});

	apiClient.interceptors.request.use(
		(config) => {
			const token = Cookies.get("token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error) => Promise.reject(error),
	);

	apiClient.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config as import(
				"axios"
			).AxiosRequestConfig & { _retry?: boolean };
			const errorMessage = error.response?.data?.message || "";
			if (errorMessage.includes("Unauthorized or invalid token")) {
				try {
					const oldToken = Cookies.get("refresh_token");
					const userId = Cookies.get("user_id");

					if (!oldToken || !userId) {
						throw new Error("Missing token or userId for refresh");
					}
					const refreshResponse = await refreshToken({
						refresh_token: oldToken,
						user_id: userId,
					});

					const newAccessToken = refreshResponse.data.jwtToken;
					if (!newAccessToken) throw new Error("Failed to retrieve new token");

					Cookies.set("token", newAccessToken);
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

					return apiClient(originalRequest);
				} catch (refreshError) {
					const refreshErrorMsg = refreshError.response?.data?.message || "";

					if (
						refreshError.response?.status === 400 ||
						refreshErrorMsg.includes("Refresh token is invalid")
					) {
						Cookies.remove("token");
						Cookies.remove("refresh_token");
						Cookies.remove("user_id");
						Router.push("/login");
					}
					return Promise.reject(refreshError);	
				}
			}

			// if (error.response?.status === 401) {
			//   Cookies.remove('token');
			//   Cookies.remove('userId');
			//   Router.push('/login');
			// }

			return Promise.reject(error);
		},
	);

	return apiClient;
};
