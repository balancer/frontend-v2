import { mock } from 'jest-mock-extended';
import { UseSor } from '../useSor';

const useSor = jest.fn(() => mock<UseSor>());

// console.log(useSor.);

export default useSor;
