import { Context as BaseContext } from '../../../chat';
import 'sugar/locales/fr';
export interface Context extends BaseContext {
    timeStart?: number;
    time?: Date;
    timeEnd?: number;
}
