import * as Sentry from '@sentry/capacitor';
export const Mlogger = {
	service: 'sentry',
	severity: {
		debug2: -1,
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
		none: 4,
	},
	step: {
		start: 0,
		end: 99,
		log: 98,
	},
	sampling: 1.0,
};
let constants = {
	service: '',
	session: '',
	apptag: '',
	severity: 0, //all logs equal or above this will get logged
	sampling: 0, //as of now, we will assume 1 -- avoid sampling
	tz: '', //zone to be used while logging a time
	flushinterval: 0, //flush interval in seconds
	logformat: '', //json
};

export function log(
	severity: number,
	step: number,
	ts: String,
	user: string,
	module: String,
	ip: string,
	msg: string,
	msgdetails: string,
	params: any
) {
	// TODO Perform parameter validation
	if (severity >= constants.severity) {
		switch (Mlogger.service) {
			case 'sentry':
				/**Sentry start */
				log_flush();
				Sentry.configureScope(function (scope) {
					scope.setUser({ username: user });
					switch (severity) {
						case Mlogger.severity.debug2:
							scope.setLevel('debug');
							break;
						case Mlogger.severity.debug:
							scope.setLevel('debug');
							break;
						case Mlogger.severity.info:
							scope.setLevel('info');
							break;
						case Mlogger.severity.warn:
							scope.setLevel('warning');
							break;
						case Mlogger.severity.error:
							scope.setLevel('error');
							break;
						case Mlogger.severity.none:
							scope.setLevel('log');
							break;
						default:
							scope.setLevel('log');
					}
				});
				switch (step) {
					case Mlogger.step.start:
						Sentry.addBreadcrumb({
							type: constants.apptag,
							level: 'info',
							event_id: '',
							category: constants.apptag,
							message:
								typeof params && typeof params[0] && typeof params[0].message
									? params[0].message
									: 'undefined',
							data:
								typeof params && typeof params[0] && typeof params[0].data
									? params[0].data
									: {},
							timestamp:
								typeof params && typeof params[0] && typeof params[0].timestamp
									? params[0].timestamp
									: 0,
						});
						Sentry.captureMessage(msg);
						break;
					case Mlogger.step.log:
						Sentry.addBreadcrumb({
							type: constants.apptag,
							level: 'info',
							event_id: '',
							category: constants.apptag,
							message:
								typeof params && typeof params.message
									? params.message
									: 'undefined',
							data: typeof params && typeof params.data ? params.data : {},
							timestamp:
								typeof params && typeof params.timestamp ? params.timestamp : 0,
						});
						Sentry.captureMessage(msg);
						break;
					case Mlogger.step.end:
						let start =
							typeof params && typeof params[0] && typeof params[0].data
								? params[0].data
								: {};
						Sentry.addBreadcrumb({
							type: constants.apptag,
							level: 'info',
							event_id: '',
							category: constants.apptag,
							message:
								typeof params && typeof params[0] && typeof params[0].message
									? params[0].message
									: 'undefined',
							data: start,
							timestamp:
								typeof params && typeof params[0] && typeof params[0].timestamp
									? params[0].timestamp
									: 0,
						});
						let end =
							typeof params && typeof params[1] && typeof params[1].data
								? params[1].data
								: {};
						end.fn_start_time = start.fn_start_time;
						end.fn_exe_time =
							((end.fn_end_time - end.fn_start_time) / 1000).toFixed(2) + 's';
						Sentry.addBreadcrumb({
							type: constants.apptag,
							level: 'info',
							event_id: '',
							category: constants.apptag,
							message:
								typeof params && typeof params[1] && typeof params[1].message
									? params[1].message
									: 'undefined',
							data: end,
							timestamp:
								typeof params && typeof params[1] && typeof params[1].timestamp
									? params[1].timestamp
									: 0,
						});
						Sentry.captureMessage(msg + ' ' + end.fn_exe_time);
						break;
				}
				/**Sentry end */
				break;
			default:
				throw new Error(
					constants.service + ' service is not supported in mlogger provider.'
				);
		}
	}
	return true;
}
export function log_flush() {
	switch (constants.service) {
		case 'sentry':
			Sentry.configureScope(function (scope) {
				scope.clearBreadcrumbs();
			});
			break;
	}
}
