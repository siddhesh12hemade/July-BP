import { log, Mlogger } from './mlogger.service';
export function systemException(obj: any) {
	logger(
		Mlogger.severity.debug,
		[],
		Mlogger.step.log,
		obj.fileName + ' in ' + obj.functionName,
		obj.error
	);
}
function logger(
	severity: any,
	obj: any,
	step: any,
	fn_name: any,
	fn_param: any
) {
	if (1) {
		let array;
		let operation;
		let data;
		switch (step) {
			case Mlogger.step.start:
				array = step;
				operation = 'Start: ';
				data = {
					fn_start_time: performance.now(),
				};
				break;
			case Mlogger.step.log:
				operation = 'Log: ';
				let paramObj = {
					data: fn_param,
					message: operation + fn_name,
					timestamp: Math.floor(Date.now() / 1000),
				};
				log(severity, step, '', '', '', '', operation + fn_name, '', paramObj);
				return;
			case Mlogger.step.end:
				array = 1;
				operation = 'End: ';
				data = {
					fn_end_time: performance.now(),
				};
				break;
		}
		data = { fn_param: fn_param };
		data = { fn_name: fn_name };
		obj[array] = {
			data: data,
			message: operation + fn_name,
			timestamp: Math.floor(Date.now() / 1000),
		};
		log(0, step, '', '', '', '', operation + fn_name, '', obj);
	}
}
