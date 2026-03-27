import { authStorage } from '../db/auth.storage';
import { CommandsStructureType, RegDataResType, RegDataReqType } from '../types/dataStructureType';

export const authService = {
  handleReg(message: CommandsStructureType<RegDataReqType>): CommandsStructureType<RegDataResType> {
    const { data } = message;

    let responseData: RegDataResType = {
      name: data.name,
      index: '',
      error: false,
      errorText: '',
    };

    const userData = authStorage.getUser(data.name);

    if (userData) {
      responseData =
        userData.password === data.password
          ? {
              ...responseData,
              index: userData.index,
            }
          : {
              ...responseData,
              index: userData.index,
              error: true,
              errorText: 'Wrong password',
            };
    } else {
      const newUser = authStorage.setUser(data);

      responseData = newUser
        ? { ...responseData, index: newUser.index }
        : { ...responseData, error: true, errorText: 'Auth server error' };
    }

    return { ...message, data: responseData };
  },
};
