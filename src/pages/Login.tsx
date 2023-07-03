import {
	IonButton,
	IonCheckbox,
	IonCol,
	IonContent,
	IonGrid,
	IonImg,
	IonInput,
	IonItem,
	IonItemDivider,
	IonLabel,
	IonList,
	IonPage,
	IonRouterLink,
	IonRow
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { toast } from "react-toastify";
import Loader from '../components/Loader';
import LoginFooter from '../components/LoginFooter';
import { BaseErrorObject, Constants } from '../utils/constants/constants';
import { IErrors, ILoginRequest } from '../utils/interfaces/Login.interface';
import { systemException } from '../utils/sentry/common.service';
import * as loginService from '../utils/services/Login.Service';
import { setEmailIdRedux } from '../utils/store/email.slice';
import { useAppSelector } from '../utils/store/hooks';
import { RememberMeInterface, selectRememberMeData, setRememberMeData } from '../utils/store/remember.slice';
import { store } from '../utils/store/store';
import {
	getErrorsInLoginRequest,
	getLoggedInUserContext,
	isEmailValid
} from '../utils/utils/Login.Utils';
import './Page.css';

const Login: React.FC = () => {
	const { i18n, t } = useTranslation();

	const history = useHistory();
	const { register, handleSubmit, watch, setError, formState, getValues, reset } =
		useForm({
			mode: 'onChange',
			defaultValues: { email: '', password: '' },
		});

	const [loading, setLoading] = useState(false);
	const rememberMeData = useAppSelector(selectRememberMeData);
	
	const [rememberMe, setRememberMe] = useState(rememberMeData?.remember);
	const [errors, setErrors] = useState<IErrors>();
	const [forgotPasswordStatus, setForgotPasswordStatus] = useState('');
	const [passwordShown, setPasswordShown] = useState<boolean>(false);
	const isBtnDisabled = () => {
		return loading;
	};

	useEffect(() => {
		if (rememberMeData?.remember) {
			reset({
				email: rememberMeData?.email,
				password: rememberMeData?.pass
			})
		}
	},[])
	const login = async (data, error) => {
		let loginRequest: ILoginRequest = {
			email: data.email,
			password: data.password,
		};
		const errors = getErrorsInLoginRequest(loginRequest);
		if (rememberMe) {
			let obj:RememberMeInterface = {
				email: data.email,
				pass: data.password,
				remember: rememberMe
			}
			store.dispatch(setRememberMeData(obj))
		}
		else {
			store.dispatch(setRememberMeData(null))
		}

		const isUserLoginpDataInvalid = Object.values(errors).some(
			(val) => val.status === true
		);
		if (isUserLoginpDataInvalid) {
			setErrors(errors);
			return;
		}

		setLoading(true);
		let res = await loginService.login(loginRequest);
		if (res.statusCode === Constants.API_SUCCESS) {

			let res = await getLoggedInUserContext({
				currentBusinessPartnerId: '',
				returnToLogin: false,
			});
			if (res.status) {
				if (res.multipleBusinessPartner) {
					history.replace({
						pathname: '/select-business-partner',
					});
				} else {
					toast.success(t("LOGIN_SUCCESSFUL"));
					history.replace({
						pathname: '/app/application-list',
					});
				}
			}
		} else {
			let obj = {
				fileName: 'Login.tsx',
				functionName: 'login()',
				error: res.message,
			};
			toast.error(res.message);
			setLoading(false);
			systemException(obj);
		}
		setLoading(false);
	};

	const onForgotPasswordClick = async () => {
		const emailValid = isEmailValid(getValues('email'));
		let errors: IErrors = BaseErrorObject;
		if (!emailValid) {
			errors = {
				...errors,
				EMAIL: { status: true, messages: [t('EMAIL_ID_ERROR')] },
			};
			setErrors(errors);
		} else {
			let res = await loginService.sendCode({ email: getValues('email') });
			const { errors, statusCode, message } = res;
			switch (statusCode) {
				case 'SUCCESS': {
					setErrors(BaseErrorObject);
					let successMsg = message ? message : i18n.t('FORGOT_PASSWORD_SUCCESSFUL');
					toast.success(successMsg);
					setForgotPasswordStatus('success');
					store.dispatch(setEmailIdRedux(getValues('email')));
					history.push({
						pathname: '/forgotPassword'
					});
					break;
				}

				case 'ERROR': {
					setErrors(BaseErrorObject);
					let errorMsg = message ? message : i18n.t('SOMETHING_WENT_WRONG');
					toast.error(errorMsg)
					setForgotPasswordStatus('failed');
					let obj = {
						fileName: 'Login.tsx',
						functionName: 'onForgotPasswordClick()',
						error: res.message,
					};
					systemException(obj);
					break;
				}
				default: {
					setErrors(BaseErrorObject);
				}
			}
		}
	};

	return (
		<IonPage className='login-page'>
			<IonContent className='white ion-padding'>
				{/* Logo section */}
				<section className='logo'>
					<IonItem lines='none' className='mb-40 mt-55'>
						<IonImg className='mx-auto' src='./img/actyv-logo.svg'></IonImg>
					</IonItem>
				</section>

				<section className='login-text'>
					<IonGrid>
						<IonRow>
							<IonCol>
								<h1 className='fs-24 fw-700 lh-34'>{t('LOGIN')}</h1>
								<p className=''>{t('LOGIN_NOTE')}</p>
							</IonCol>
						</IonRow>
					</IonGrid>
				</section>
				<Loader isloading={loading} />
				{/* login section */}
				{!loading && (
				<section className='login-form-wrapper mb-22'>
					<form onSubmit={handleSubmit(login)}>
						<IonGrid className='pb-0'>
							<IonRow>
								<IonCol className='pb-0'>
									<IonList className='pb-0'>
										<IonItem lines='none' className='input-item mb-13'>
											<IonInput
												placeholder={t("EMAIL")}
												{...register('email')}
											></IonInput>
											<IonImg src='./img/mail.svg' alt='mail-icon'></IonImg>
										</IonItem>
										{errors &&
											errors.EMAIL.status &&
											errors.EMAIL.messages.map((message, index) => (
												<div key={index} className='validationError'>
													{message}
												</div>
											))}
										<IonItem lines='none' className='input-item'>
											<IonInput
												placeholder={t("ENTER_PASSWORD")}
												type={passwordShown ? 'text' : 'password'}
												{...register('password')}
											></IonInput>

											{passwordShown ? (
												<IonImg
													src='./img/eye-show.svg'
													onClick={() => {
														setPasswordShown(!passwordShown);
													}}
												></IonImg>
											) : (
												<IonImg
													src='./img/eye.svg'
													onClick={() => {
														setPasswordShown(!passwordShown);
													}}
												></IonImg>
											)}
										</IonItem>
										{errors &&
											errors.PASSWORD.status &&
											errors.PASSWORD.messages.map((message, index) => (
												<div key={index} className='validationError'>
													{message}
												</div>
											))}
									</IonList>
								</IonCol>
							</IonRow>

							<IonRow className='ion-align-items-center ion-justify-content-between'>
								<IonCol size='auto'>
									<IonItem lines='none'>
										<IonCheckbox
											className='checkbox-custom'
											slot='start'
											checked={rememberMe}
											onIonChange={({ detail: { checked } }) => {
												setRememberMe(checked)
											}}
										></IonCheckbox>
										<IonLabel className='fs-11'>{t('REMEMBER_ME')}</IonLabel>
									</IonItem>
								</IonCol>
								<IonCol size='auto' className=''>
									<IonRouterLink
										className='fw-600 fs-11 primary-color'
										onClick={onForgotPasswordClick.bind(this)}
									>
										{t('FORGOT_PASSWORD')}
									</IonRouterLink>
								</IonCol>
							</IonRow>
							<IonRow>
								<IonCol>
									<IonButton
										disabled={isBtnDisabled()}
										type='submit'
										className='button-expand'
										expand='block'
									>
										{t('LOGIN_BUTTON')}
									</IonButton>
								</IonCol>
							</IonRow>
						</IonGrid>
					</form>
				</section>
				)}
				{!loading && (
				<>
				<IonGrid class='mb-22'>
					<IonRow>
						<IonCol>
							<IonItemDivider className='divider mh-auto'>
								<p className='divider-text fs-11'>{t('OR')}</p>
							</IonItemDivider>
						</IonCol>
					</IonRow>
				</IonGrid>
				<section>
					<IonGrid>
						<IonRow>
							<IonCol className='ion-text-center'>
								<IonRouterLink className='fs-11' routerLink='/Login-otp'>
									<IonButton
										expand='block'
										className='button-outline  fs-12 fw-600'
										fill='outline'
									>
										<IonImg
											class='icon-space'
											src='./img/buttons.svg'
											alt='mail-icon'
										></IonImg>
										{t('LOGIN_WITH_OTP')}
									</IonButton>
								</IonRouterLink>
							</IonCol>
						</IonRow>
					</IonGrid>
				</section>
				<section className='signup-text'>
					<IonGrid>
						<IonRow>
							<IonCol className='ion-text-center'>
								<p>
									{t('DONT_HAVE_ACCOUNT')}
									<IonRouterLink
										routerLink='./app/signup'
										className='primary-color fw-600'
									>
										{t('SIGN_UP1')}
									</IonRouterLink>
								</p>
							</IonCol>
						</IonRow>
					</IonGrid>
				</section>
				<LoginFooter />
				</>
				)}
			</IonContent>
		</IonPage>
	);
};

export default Login;
