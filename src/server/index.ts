import * as akala from '@akala/server';
import * as path from 'path';
import * as chat from '@domojs/chat';

export * from './interpreter';

akala.injectWithNameAsync(['$agent.chat'], function (client)
{
    akala.api.jsonrpcws(chat.meta).createServerProxy(client).register({ path: path.resolve(__dirname, './interpreter'), name: 'date' });
});
