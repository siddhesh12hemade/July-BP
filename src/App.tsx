import {
	IonApp,
	IonRouterOutlet,
	IonSplitPane,
	isPlatform,
	setupIonicReact,
	useIonAlert,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { useHistory } from "react-router-dom";
import { Redirect, Route } from "react-router-dom";
import Menu from "./components/Menu";
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
/* Theme variables */
import { App as CapApp, URLOpenListenerEvent } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import * as Sentry from "@sentry/capacitor";
import { Suspense, useEffect, useState } from "react";
import AllApplications from "./pages/AllApplications";
import CrossVerification from "./pages/CrossVerification";
import GstVerification from "./pages/GstVerification";
import Login from "./pages/Login";
import LoginMobile from "./pages/LoginMobile";
import NotificationList from "./pages/NotificationList";
import SelectBusinessPartner from "./pages/SelectBusinessPartner";
import VerifyMobileOtp from "./pages/VerifyMobileOtp";
import "./theme/style-partner.scss";
import "./theme/style.scss";
import "./theme/variables.css";
import { useAppSelector } from "./utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "./utils/store/user.slice";
import "./utils/translations/index.ts";

import ApplicationDetailView from "./pages/ApplicationDetailView";
import BankStatement from "./pages/BankStatement";
import CINNumber from "./pages/CinNumber";
import CreditInformationReport from "./pages/CreditInformationReport";
import CustomForm from "./pages/CustomForm";
import GSTReturnPDFUpload from "./pages/GSTReturnPDFUpload";
import GSTReturnPull from "./pages/GSTReturnPull";
import ItrUpload from "./pages/ITRupload";
import PanBusiness from "./pages/PanBusiness";
import PanVerification from "./pages/PanVerification";
import UdyamVerification from "./pages/UdyamVerification";
import { Constants } from "./utils/constants/constants";
import { Helpers } from "./utils/utils/Helpers";

import createMatcher from "feather-route-matcher";
import ToastContainers from "./components/ToastContainers";
import AadhaarVerification from "./pages/AadhaarCardVerification";
import AppInfo from "./pages/AppInfo";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import { getLoggedInUserContext } from "./utils/utils/Login.Utils";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import _ from "lodash";
declare var IRoot;

Sentry.init({
	dsn: process.env.REACT_APP_SENTRY_DSN_KEY,
	release: "business-partner@iossentrytest",
	dist: "build",
});

setupIonicReact();

const getLaunchUrl = async () => {
	try {
		const { url } = await CapApp.getLaunchUrl();
		return url;
	} catch (e) {
		return null;
	}
};

const getMatchedRoute = (url) => {
	if (!url) return null;
	let routeMatcher = createMatcher({
		"/go/business/signup/:inviteId": "signup-invite",
		"/go/business/signup": "signup",
		"/*": "not-found",
	});

	let urlObj = new URL(url);
	const baseUrl = urlObj.origin;

	const slug = url.split(baseUrl).pop();
	return routeMatcher(slug);
};

const isRootRoute = (url) => {
	if (!url) return null;
	let routeMatcher = createMatcher({
		"/login": "login",
		"/app/application-list": "app-list",
	});

	let urlObj = new URL(url);
	const baseUrl = urlObj.origin;

	const slug = url.split(baseUrl).pop();
	return routeMatcher(slug);
};

const MiddleWareRoute = ({ component: Component, ...rest }) => {
	// Add your own authentication on the below line.
	return (
		<Route
			{...rest}
			render={(props) =>
				Helpers.isLoggedIn() ? (
					<Component {...props}   />
				) : (
					<Redirect
						to={{ pathname: "/login", state: { from: props.location } }}
					/>
				)
			}
		/>
	);
};

const AppInit: React.FC<any> = () => {
	let history = useHistory();
	const [presentAlert] = useIonAlert();
	const { t } = useTranslation();	

	useEffect(() => {
		if (isPlatform("android") || isPlatform("ios")) {
			IRoot.isRooted(
				(data) => {
					// check data value against true NOT 1
					if (data && data === true) {
						presentAlert({
							cssClass: "alert-custom",
							header: t("DEVICE_ROOTED_HEADER"),
							message: t("DEVICE_ROOTED_MSG"),
							buttons: [
							  {
								text: "OK",
								cssClass: "primary-color",
								handler: () => {
									CapApp.exitApp();
								},
							  },
							],
						  });
					} else {
						init();
					}
				},
				(data) => {
					init();
				}
			);
		} else {
			init();
		}
	}, []);

	const init = async () => {
		CapApp.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
			let matchedRoute = getMatchedRoute(event.url);

			if (matchedRoute) {
				if (matchedRoute.value === "signup-invite") {
					history.replace(`/app/signup/${matchedRoute.params.inviteId}`);
				} else if (matchedRoute.value === "signup") {
					history.replace(`/app/signup`);
				}
			}
		});

		if (Capacitor.isNativePlatform()) {

			document.addEventListener('ionBackButton', (ev) => {
				// @ts-ignore
				ev.detail.register(10, (processNextHandler) => {					

					let url = window.location.href
					let isMain = isRootRoute(url)
					if (isMain || _.size(history) === 1)
						CapApp.exitApp();
					else {
						history.goBack()
					}
				});
			});
		}
	};

	const currentBusinessPartnerId = useAppSelector<string>(
		selectCurrentBusinessPartnerId
	);

	const canFetchUser = async () => {
		const url = await getLaunchUrl();
		let matchedRoute = getMatchedRoute(url);

		return (
			Helpers.isLoggedIn() &&
			!(
				matchedRoute?.value === "signup-invite" ||
				matchedRoute?.value === "signup"
			)
		);
	};

	const fetchUser = async () => {
		if (await canFetchUser())
			getLoggedInUserContext({ currentBusinessPartnerId, returnToLogin: true });
	};

	useEffect(() => {
		fetchUser();
		StatusBar.setStyle({ style: Style.Light });
	}, [currentBusinessPartnerId]);
	return null;
};

const App: React.FC = () => {
	const currentBusinessPartnerId = useAppSelector<string>(
		selectCurrentBusinessPartnerId
	);
	const StartupComponent: React.FC<any> = () => {
		let history = useHistory();
		const [startRedirect, setStartRedirect] = useState(false);
		useEffect(() => {
			init();
		}, []);

		const init = async () => {
			const url = await getLaunchUrl();
			let matchedRoute = getMatchedRoute(url);

			if (matchedRoute) {
				if (
					matchedRoute.value !== "signup-invite" &&
					matchedRoute.value !== "signup"
				)
					setStartRedirect(true);
			} else setStartRedirect(true);
		};

		if (startRedirect) {
			if (!Helpers.isLoggedIn())
				history.replace({
					pathname: '/login',
				});
			else {
				if (!currentBusinessPartnerId)
					history.replace({
						pathname: '/select-business-partner',
					});

				else
					history.replace({
						pathname: '/app/application-list',
					});
			}
		}
		return <></>
	};


	return (
		<>
			<ToastContainers />
			<Suspense fallback={"Loading.."}>
				<IonApp>

					<IonReactRouter>
						<AppInit></AppInit>

						<IonSplitPane contentId="main">
							<Menu />
							<IonRouterOutlet id="main">

								<Route exact path="/">
									<StartupComponent></StartupComponent>
								</Route>

								<Route path="/login" exact={true}>
									<Login />
								</Route>
								<Route path="/forgotPassword" exact={true}>
									<ForgotPassword />
								</Route>
								<Route path="/app/verify-otp" exact={true}>
									<VerifyMobileOtp />
								</Route>

								<Route path="/Login-otp" exact={true}>
									<LoginMobile />
								</Route>
								<Route path={`/${Constants.APP_STRING}/signup`}>
									<Signup />
								</Route>
								<Route path={`/${Constants.APP_STRING}/signup/:inviteId`}>
									<Signup />
								</Route>
								<Route path="/app-info" exact={true}>
									<AppInfo />
								</Route>
								<MiddleWareRoute
									path={`/${Constants.APP_STRING}/notification-list`}
									exact={true}
									component={NotificationList}
								/>
								<MiddleWareRoute
									path={`/${Constants.APP_STRING}/application-list`}
									exact={true}
									component={AllApplications}
								/>
								<MiddleWareRoute
									path="/cross-verification"
									component={CrossVerification}
								/>
								<MiddleWareRoute
									path="/business-pan-verification"
									component={PanBusiness}
								/>
								<MiddleWareRoute
									path="/gst-certificate/:act"
									component={GstVerification}
								/>
								<MiddleWareRoute
									path="/pan-Verification"
									component={PanVerification}
								/>

								<MiddleWareRoute
									path="/aadhaar-verification"
									component={AadhaarVerification}
								/>
								<MiddleWareRoute
									path="/udyam-Verification"
									component={UdyamVerification}
								/>
								<MiddleWareRoute path="/itr-upload" component={ItrUpload} />
								<MiddleWareRoute
									path="/gst-return-pdf-upload"
									component={GSTReturnPDFUpload}
								/>
								<MiddleWareRoute
									path="/select-business-partner"
									component={SelectBusinessPartner}
								/>
								<MiddleWareRoute
									path="/bank-statement"
									component={BankStatement}
								/>
								<MiddleWareRoute path="/gstr" component={GSTReturnPull} />
								<MiddleWareRoute
									path="/bureau"
									component={CreditInformationReport}
								/>
								<MiddleWareRoute
									path="/cin-verification"
									component={CINNumber}
								/>
								<MiddleWareRoute
									path={`/${Constants.APP_STRING}/custom-form/edit`}
									component={CustomForm}
								/>
								<MiddleWareRoute
									path={`/${Constants.APP_STRING}/application-details/:applicationId`}
									component={ApplicationDetailView}
								/>
								
							</IonRouterOutlet>
						</IonSplitPane>
					</IonReactRouter>
				</IonApp>
			</Suspense>
		</>
	);
};
export default App;
