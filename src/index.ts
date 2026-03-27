import { WebSocketServer } from 'ws';
import { handleClose, handleMessage } from './handlers/handler';
import { CommandType } from './types/dataStructureType';
import { clientsStorage } from './db/auth.storage';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`Server started on ws://localhost:${PORT}`);
});

wss.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', raw => {
    try {
      const message = JSON.parse(raw.toString());
      const response = handleMessage(message, ws);

      if (response?.type === CommandType.REG && !response.data.error) {
        clientsStorage.setClient(ws, {
          userId: response.data.index as string,
          userName: response.data.name as string,
        });
      }

      if (response) {
        ws.send(JSON.stringify(response));
      }
    } catch (e) {
      const err = e as Error;
      console.error(err.message);
    }
  });

  ws.on('close', () => {
    handleClose(ws);
  });
});
