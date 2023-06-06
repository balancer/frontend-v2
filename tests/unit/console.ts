import { isString } from 'lodash';
import { inspect } from 'util';

export function silenceConsoleLog(
  vi,
  silenceRulesCallback: (string) => boolean
) {
  const originalConsoleLog = console.log;
  return vi
    .spyOn(console, 'log')
    .mockImplementation((message, optionalParams) => {
      if (isString(message) && silenceRulesCallback(message)) return;

      originalConsoleLog(message, optionalParams);
    });
}

export function logRawObject(reactiveObject) {
  console.log(inspect(reactiveObject));
}
