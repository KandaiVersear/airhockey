airhockeyのフロント
ゲームのルームを管理するページとゲームをプレイするページがある。HTMLで作っていたが、遷移するとwebsocketを再接続する必要があったため、SPAが容易に作れるNext.jsで実装した。

問題点
leaveRoom、試合後のhomeページの設計が甘い。接続人数がいるはずなのに0になっていたり、オンラインなのにオフラインになっていたりする。 backendとも連携して解決するとよさそう
TODO: result画面をつくって結果を表示

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
