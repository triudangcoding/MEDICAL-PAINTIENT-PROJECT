import * as otpGenerator from 'otp-generator';

export function oneTimePassword() {
  return otpGenerator.generate(4, {
    digits: true,
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });
}
