import React, { useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Button,
  ConversationView,
  LanguageSwitcher,
  MessageBubble,
  MessageInput,
  MessageList,
  TransferToHumanButton,
  TypingIndicator,
  chatT,
} from '@zanehu-ai/x-ui';

const tenantId = 'gallery-local-tenant';
const conversationId = 'local-conversation';

function sampleMessages() {
  return [
    { id: 'welcome', conversationId, role: 'system', content: 'Local demonstration conversation', createdAt: '2026-10-13T00:00:00+08:00' },
    { id: 'question', conversationId, role: 'user', content: 'Can we make the next step easier to understand?', createdAt: '2026-10-13T00:01:00+08:00' },
    { id: 'answer', conversationId, role: 'ai', content: 'Yes. Start with one clear action, then show what happens after it.', createdAt: '2026-10-13T00:02:00+08:00' },
  ];
}

function localReply(language, content, handoff) {
  if (language === 'zh') return handoff ? '本地演示：已加入一条人工客服回复。没有联系真实客服。' : `本地演示已收到：“${content}”。这条回复由浏览器中的示例数据生成。`;
  if (language === 'ru') return handoff ? 'Локальный пример: добавлен ответ оператора. Реальный оператор не подключён.' : `Локальный пример получил: «${content}». Этот ответ создан из демонстрационных данных.`;
  return handoff ? 'Local demo: a human-agent reply has been added. No real person was contacted.' : `Local demo received: “${content}”. This reply comes from the browser’s sample data.`;
}

export function ChatPanel() {
  const [language, setLanguage] = useState('en');
  const [closed, setClosed] = useState(false);
  const [listMode, setListMode] = useState('messages');
  const [standaloneMessages, setStandaloneMessages] = useState(sampleMessages);
  const [transferNotice, setTransferNotice] = useState('Try a local handoff in any of the three languages.');
  const [inputNotice, setInputNotice] = useState('Messages sent here appear in the message list above.');
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false }, mutations: { retry: false } } }));
  const localConversation = useRef(null);
  const messageSequence = useRef(0);
  if (!localConversation.current) localConversation.current = sampleMessages();

  const fetcher = useMemo(() => ({
    listMessages: async () => localConversation.current.map((message) => ({ ...message })),
    sendUserMessage: async ({ content, language: nextLanguage, conversationId: targetId }) => {
      const sequence = ++messageSequence.current;
      const handoff = content === chatT(nextLanguage, 'transfer.label');
      localConversation.current = [
        ...localConversation.current,
        { id: `local-user-${sequence}`, conversationId: targetId, role: 'user', content, language: nextLanguage, createdAt: new Date().toISOString() },
        { id: `local-reply-${sequence}`, conversationId: targetId, role: handoff ? 'agent' : 'ai', content: localReply(nextLanguage, content, handoff), language: nextLanguage, createdAt: new Date().toISOString() },
      ];
    },
  }), []);

  function resetConversation() {
    localConversation.current = sampleMessages();
    setClosed(false);
    void queryClient.invalidateQueries({ queryKey: ['chat', 'messages', tenantId, conversationId] });
  }

  async function sendStandalone(content) {
    const sequence = ++messageSequence.current;
    setStandaloneMessages((messages) => [...messages, { id: `standalone-${sequence}`, conversationId: 'local-message-list', role: 'user', content, createdAt: new Date().toISOString() }]);
    setListMode('messages');
    setInputNotice(`Sent locally: “${content}”.`);
  }

  async function transferLocally(phrase) {
    const sequence = ++messageSequence.current;
    setTransferNotice(`Local handoff requested with: “${phrase}”. No real person was contacted.`);
    setStandaloneMessages((messages) => [...messages, { id: `handoff-${sequence}`, conversationId: 'local-message-list', role: 'agent', content: localReply(language, phrase, true), createdAt: new Date().toISOString() }]);
    setListMode('messages');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="demo-grid">
        <section className="demo-card demo-card-wide" id="chat-conversation" tabIndex={-1}>
          <h3>Conversation</h3>
          <p className="demo-code-list"><code>ConversationView</code></p>
          <p className="demo-note">Send a message, switch language or try a handoff. An explicit in-memory fetcher supplies this conversation; no chat API or external service is used.</p>
          <div className="demo-row">
            <Button variant="outline" aria-pressed={closed} onClick={() => setClosed((value) => !value)}>{closed ? 'Reopen local conversation' : 'Close local conversation'}</Button>
            <Button variant="outline" onClick={resetConversation}>Reset conversation</Button>
          </div>
          <p className="demo-status" role="status">{closed ? 'Conversation closed. Message and handoff actions are disabled.' : 'Conversation open. Replies are generated from local sample data.'}</p>
          <div className="demo-chat">
            <ConversationView
              tenantId={tenantId}
              conversationId={conversationId}
              language={language}
              onLanguageChange={setLanguage}
              fetcher={fetcher}
              closed={closed}
            />
          </div>
        </section>

        <section className="demo-card" id="chat-message-bubble" tabIndex={-1}>
          <h3>Message bubbles</h3>
          <p className="demo-code-list"><code>MessageBubble</code></p>
          <p className="demo-note">System, user, AI and human-agent roles. Hover a message to reveal its timestamp.</p>
          <div className="demo-stack">
            {[
              ...sampleMessages(),
              { id: 'agent-example', conversationId, role: 'agent', content: 'I can help with the next step.', createdAt: '2026-10-13T00:03:00+08:00' },
            ].map((message) => <MessageBubble key={message.id} message={message} language={language} />)}
          </div>
        </section>

        <section className="demo-card" id="chat-message-list" tabIndex={-1}>
          <h3>Message list &amp; composer</h3>
          <p className="demo-code-list"><code>MessageList</code> <code>MessageInput</code></p>
          <div className="demo-row" role="group" aria-label="Message list specimen state">
            {['messages', 'empty', 'loading'].map((mode) => <Button key={mode} variant={listMode === mode ? 'primary' : 'outline'} aria-pressed={listMode === mode} onClick={() => setListMode(mode)}>{mode[0].toUpperCase() + mode.slice(1)}</Button>)}
          </div>
          <div className="demo-chat-list">
            <MessageList messages={listMode === 'messages' ? standaloneMessages : []} language={language} loading={listMode === 'loading'} />
          </div>
          <MessageInput language={language} onSend={sendStandalone} />
          <p className="demo-status" role="status">{inputNotice}</p>
        </section>

        <section className="demo-card" id="chat-language-handoff" tabIndex={-1}>
          <h3>Language &amp; handoff</h3>
          <p className="demo-code-list"><code>LanguageSwitcher</code> <code>TransferToHumanButton</code></p>
          <div className="demo-stack">
            <div className="demo-row">
              <LanguageSwitcher value={language} onChange={setLanguage} />
              <TransferToHumanButton language={language} onTransfer={transferLocally} />
            </div>
            <p className="demo-status" role="status">{transferNotice}</p>
            <p className="demo-note">The selected language updates component labels throughout this panel. Existing message content stays in its original language.</p>
            <div className="demo-row">
              <TransferToHumanButton language={language} disabled onTransfer={transferLocally} />
              <span className="demo-note">Disabled state</span>
            </div>
          </div>
        </section>

        <section className="demo-card" id="chat-typing" tabIndex={-1}>
          <h3>Typing indicators</h3>
          <p className="demo-code-list"><code>TypingIndicator</code></p>
          <div className="demo-stack">
            <TypingIndicator who="ai" language={language} />
            <TypingIndicator who="agent" language={language} />
            <p className="demo-note">Both roles expose polite live status announcements.</p>
          </div>
        </section>
      </div>
    </QueryClientProvider>
  );
}
