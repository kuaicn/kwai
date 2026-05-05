/**
 * ClinkAgent - TypeScript 版本
 * 基于原始 clink toolbar JS 库转换
 */

/* ======================== 外部依赖声明 ======================== */
declare const SockJS: any;
declare const Stomp: any;
declare const SIP: any;
declare const CryptoJS: any;

declare global {
  interface Window {
    WEB_SOCKET_SWF_LOCATION?: string;
    WEB_SOCKET_DEBUG?: boolean;
  }
}

/* ======================== 类型定义 ======================== */

export interface LoginParams {
  cno: string | number;
  password?: string;
  identifier?: string;
  forceLoginCheck?: boolean | string;
  bindType?: number | string;
  type?: number | string;
  [key: string]: any;
}

export interface OnlineParams {
  sessionKey?: string;
  identifier: string;
  enterpriseId: string | number;
  cno: string | number;
  bindType?: number;
  bindTel?: string | number;
  qids?: string;
  emailQids?: string;
  loginStatus?: number;
  pauseDescription?: string | null;
  webSocketUrl?: string;
  sipIp?: string;
  sipPwd?: string;
  webrtcSocketUrl?: string;
  webrtcStunServer?: string;
  webrtcAutoAnswer?: any;
  webrtcExpiresTime?: number;
  debug?: boolean;
  token?: string;
  loginType?: number;
  chatLoginStatus?: number;
  chatPauseDescription?: string | null;
  chatLimitNumber?: number;
  answerCallsByCloseBrowser?: number;
  unbindPhoneByCloseBrowser?: number;
  timeStamp?: string;
  forceLoginCheck?: boolean;
  allowBackward?: boolean;
  [key: string]: any;
}

export interface LogoutParams {
  removeBinding?: number;
  logoutMode?: number;
  logoutType?: number;
  chatClose?: number;
  answerCallsByCloseBrowser?: number;
  unbindPhoneByCloseBrowser?: number;
  automatic?: number;
}

export interface PauseParams {
  pauseType?: number;
  pauseDescription?: string;
}

export interface PreviewOutcallParams {
  tel: string;
  timeout?: number;
  dialTelTimeout?: number;
  obClid?: string;
  obClidGroup?: string;
  requestUniqueId?: string;
  userField?: Record<string, any>;
  backupTels?: string;
  callType?: number;
  taskId?: number | null;
  taskInventoryId?: number | null;
}

export interface TransferParams {
  transferObject: string;
  objectType: number;
  transferVariables?: any;
}

export interface ConsultParams {
  consultObject: string;
  objectType: number;
}

export interface InteractParams {
  interactType: string;
  interactedCno?: string;
  ivrId?: string;
  ivrNode?: string;
  interactVariables?: any;
}

export interface DtmfParams {
  digits: string;
  direction: 'in' | 'out';
  duration?: number;
  gap?: number;
}

export interface ChatMessageParams {
  mainUniqueId: string;
  content: string;
  messageType?: string;
  messageId?: string;
}

export interface ChatTransferParams {
  mainUniqueId: string;
  targetNo: string;
  targetType: number;
  transferByType?: number;
}

export interface GroupParams {
  mainUniqueId: string;
  inviteeCno?: string;
  inviterCno?: string;
}

export interface RemoteControlParams {
  mainUniqueId: string;
}

export interface EmailParams {
  sessionId: string;
  targetCno?: string;
  targetQno?: string;
  enterpriseEmail?: string;
}

export interface StatusParams {
  monitoredCno?: string;
}

export interface ChangeBindTelParams {
  bindTel: number;
  bindType: number;
}

export interface ProlongWrapupParams {
  wrapupTime: number;
}

export interface InvestigationParams {
  cno?: string;
}

export interface SpyParams {
  cno: string;
}

export interface PlaybackParams {
  action: string;
  playUrl?: string;
  skipMs?: number;
}

export interface SipCallParams {
  tel: string;
}

export interface TokenMessage {
  type: 'event' | 'response';
  event?: string;
  reqType?: string;
  code?: number | string;
  enterpriseId?: number;
  cno?: string | number;
  values?: any;
  [key: string]: any;
}

export type EventListener = (token: TokenMessage) => void;
export type ResponseCallback = (token: TokenMessage) => void;

export interface AgentState {
  ready: boolean;
  debug: boolean;
  sipPhone: boolean;
  connecting: boolean;
  connected: boolean;
  connectionCloseCount: number;
  sessionId: string;
  lastPingTime: number | null;
  pingValue: boolean;
  pingTimer: any;
  latency: number;
  logout: boolean;
  connectInterval: number;
  randoms: number;
  identifier: string;
  webSocketUrl: string;
  allowBackward: boolean;
  answerCallsByCloseBrowser: number;
  unbindPhoneByCloseBrowser: number;
  breakLines: any[];
  callback?: () => void;
}

/* ======================== 工具 ======================== */

const logger = {
  debug(message: string) {
    if (GLOBAL.debug) print(message, '');
  },
  info(message: string) {
    if (GLOBAL.debug) print(message, 'blue');
  },
  warn(message: string) {
    if (GLOBAL.debug) print(message, 'orange');
  },
  error(message: string) {
    if (GLOBAL.debug) print(message, 'red');
  },
  log(message: string, color?: string) {
    if (GLOBAL.debug) print(message, color);
  },
};

function print(message: string, color?: string) {
  const style = color ? `color:${color}` : '';
  if (typeof window !== 'undefined' && window.console) {
    window.console.log(`%c[${new Date()}] ${message}`, style);
  }
}

const EventUtil = {
  addHandler(element: any, type: string, handler: any) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handler);
    } else {
      element['on' + type] = handler;
    }
  },
  removeHandler(element: any, type: string, handler: any) {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false);
    } else if (element.detachEvent) {
      element.detachEvent('on' + type, handler);
    } else {
      element['on' + type] = null;
    }
  },
};

/* ======================== JSON Polyfill ======================== */
(function () {
  if (!window.JSON) {
    logger.warn('window has no object: JSON!');
    (window as any).JSON = {};
  }

  function f(n: number) {
    return n < 10 ? '0' + n : String(n);
  }

  if (typeof Date.prototype.toJSON !== 'function') {
    (Date.prototype as any).toJSON = function (key?: any) {
      return isFinite(this.valueOf())
        ? this.getUTCFullYear() +
            '-' +
            f(this.getUTCMonth() + 1) +
            '-' +
            f(this.getUTCDate()) +
            'T' +
            f(this.getUTCHours()) +
            ':' +
            f(this.getUTCMinutes()) +
            ':' +
            f(this.getUTCSeconds()) +
            'Z'
        : null;
    };
    (String.prototype as any).toJSON =
      (Number.prototype as any).toJSON =
      (Boolean.prototype as any).toJSON =
        function (key?: any) {
          return this.valueOf();
        };
  }

  const cx =
      /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable =
      /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  let gap: string, indent: string, rep: any;

  const meta: Record<string, string> = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\',
  };

  function quote(string: string) {
    escapable.lastIndex = 0;
    return escapable.test(string)
      ? '"' +
          string.replace(escapable, function (a) {
            const c = meta[a];
            return typeof c === 'string'
              ? c
              : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          }) +
          '"'
      : '"' + string + '"';
  }

  function str(key: any, holder: any) {
    let i: number, k: string, v: any, length: number;
    const mind = gap;
    let partial: string[] = [];
    let value = holder[key];

    if (
      value &&
      typeof value === 'object' &&
      typeof value.toJSON === 'function'
    ) {
      value = value.toJSON(key);
    }
    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }
    switch (typeof value) {
      case 'string':
        return quote(value);
      case 'number':
        return isFinite(value) ? String(value) : 'null';
      case 'boolean':
      case 'undefined':
        if (value === undefined) return 'null';
        return String(value);
      case 'object':
        if (!value) {
          return 'null';
        }
        gap += indent;
        partial = [];
        if (Object.prototype.toString.apply(value) === '[object Array]') {
          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }
          const arrVal =
            partial.length === 0
              ? '[]'
              : gap
              ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
              : '[' + partial.join(',') + ']';
          gap = mind;
          return arrVal;
        }
        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            k = rep[i];
            if (typeof k === 'string') {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {
          for (k in value) {
            if (Object.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }
        const objVal =
          partial.length === 0
            ? '{}'
            : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}';
        gap = mind;
        return objVal;
    }
    return undefined;
  }

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (
      value: any,
      replacer?: any,
      space?: number | string,
    ) {
      let i: number;
      gap = '';
      indent = '';
      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }
      } else if (typeof space === 'string') {
        indent = space;
      }
      rep = replacer;
      if (
        replacer &&
        typeof replacer !== 'function' &&
        (typeof replacer !== 'object' ||
          typeof replacer.length !== 'number')
      ) {
        throw new Error('JSON.stringify');
      }
      return str('', { '': value });
    };
  }
  if (typeof JSON.parse !== 'function') {
    JSON.parse = function (text: string, reviver?: any) {
      let j: any;

      function walk(holder: any, key: string) {
        let k: string,
          v: any,
          value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
        text = text.replace(cx, function (a) {
          return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }
      if (
        /^[\],:{}\s]*$/.test(
          text
            .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
            .replace(
              /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
              ']',
            )
            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''),
        )
      ) {
        j = eval('(' + text + ')');
        return typeof reviver === 'function' ? walk({ '': j }, '') : j;
      }
      throw new SyntaxError('JSON.parse');
    };
  }
})();

/* ======================== 常量 ======================== */

export const EVENT_TYPE = {
  STATUS: 'status',
  PREVIEW_OUTCALL_START: 'previewOutcallStart',
  PREVIEW_OUTCALL_RINGING: 'previewOutcallRinging',
  PREVIEW_OUTCALL_BRIDGE: 'previewOutcallBridge',
  CONSULT_START: 'consultStart',
  CONSULT_LINK: 'consultLink',
  UNCONSULT: 'unconsult',
  CONSULT_ERROR: 'consultError',
  CONSULT_THREEWAY: 'consultThreeway',
  CONSULT_THREEWAY_UNLINK: 'consultThreewayUnlink',
  CONSULT_TRANSFER: 'consultTransfer',
  RINGING: 'ringing',
  PREVIEW_OUTCALL: 'previewOutcall',
  KICKOUT: 'kickout',
  BREAK_LINE: 'breakLine',
  SIP_DISCONNECTED: 'sipDisconnected',
  SIP_CONNECTED: 'sipConnected',
  SIP_REGISTERED: 'sipRegistered',
  INTERACT_RETURN: 'interactReturn',
  QUEUE_STATUS: 'queueStatus',
  OB_REMEMBER_BUSY: 'obRememberBusy',
  NO_ANSWER: 'noAnswer',
  UNREACHABLE_AUTO_PAUSE: 'unreachableAutoPause',
  CHAT_BRIDGE: 'chatBridge',
  CHAT_CLOSE: 'chatClose',
  CHAT_OFFLINE: 'chatOffline',
  CHAT_ONLINE: 'chatOnline',
  CHAT_TRANSFER: 'chatTransfer',
  CHAT_INVESTIGATION: 'chatInvestigation',
  CHAT_STATUS: 'chatStatus',
  CHAT_QUEUE_STATUS: 'chatQueueStatus',
  CHAT_AGENT_REMIND: 'chatAgentRemind',
  REMOTE_CONTROL_REJECT: 'remoteControlReject',
  REMOTE_CONTROL_TIMEOUT: 'remoteControlTimeOut',
  REMOTE_CONTROL_READY: 'remoteControlReady',
  AGENDA_REMIND: 'agendaRemind',
  TICKET_NOTICE: 'ticketNotice',
  TASK_PROPERTY_START: 'taskPropertyStart',
  TASK_PROPERTY_PAUSE: 'taskPropertyPause',
  EMAIL_UNREAD_COUNT: 'emailUnreadCount',
  EMAIL_MESSAGE: 'emailMessage',
  EMAIL_CLAIM: 'emailClaim',
  EMAIL_RECOVERY: 'emailRecovery',
  EMAIL_RUBBISH: 'emailRubbish',
  EMAIL_READ: 'emailRead',
  EMAIL_TRANSFER: 'emailTransfer',
  EMAIL_INVESTGATION: 'emailInvestgation',
  EMAIL_FINISH: 'emailFinish',
  ANNOUNCEMENT: 'announcement',
  VISITORVIDEOREADY: 'visitorVideoReady',
  VISITORVIDEOHANGUP: 'visitorVideoHangUp',
  KS_HANGUP: 'ks_hangup',
} as const;

export const RESPONSE_TYPE = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  QUEUE_STATUS: 'queueStatus',
  PAUSE: 'pause',
  UNPAUSE: 'unPause',
  STATUS: 'status',
  PREVIEW_OUTCALL: 'previewOutcall',
  DIRECT_CALL_START: 'directCallStart',
  CHANGE_BIND_TEL: 'changeBindTel',
  SET_CDR_TAG: 'setCdrTag',
  PROLONG_WRAPUP: 'prolongWrapup',
  UNLINK: 'unlink',
  PREVIEW_OUTCALL_CANCEL: 'previewOutcallCancel',
  HOLD: 'hold',
  UNHOLD: 'unhold',
  CONSULT: 'consult',
  CONSULT_CANCEL: 'consultCancel',
  CONSULT_TRANSFER: 'consultTransfer',
  UNCONSULT: 'unconsult',
  TRANSFER: 'transfer',
  INTERACT: 'interact',
  INVESTIGATION: 'investigation',
  REFUSE: 'refuse',
  MUTE: 'mute',
  UNMUTE: 'unmute',
  ENTERPRISE_PAUSE: 'enterprise_pause',
  SET_USER_DATA: 'setUserData',
  GET_USER_DATA: 'getUserData',
  DTMF: 'dtmf',
  CONTROL_PLAYBACK: 'controlPlayback',
  SEND_VERIFICATION_CODE: 'sendVerificationCode',
  SIP_CALL: 'sipCall',
  SIP_LINK: 'sipLink',
  SIP_UNLINK: 'sipUnlink',
  SIP_DTMF: 'sipDTMF',
  PING: 'ping',
  SPY: 'spy',
  UNSPY: 'unspy',
  THREEWAY: 'threeway',
  UNTHREEWAY: 'unthreeway',
  WHISPER: 'whisper',
  UNWHISPER: 'unwhisper',
  PICKUP: 'pickup',
  DISCONNECT: 'disconnect',
  BARGE: 'barge',
  PAUSE_CLIENT: 'pause_client',
  UNPAUSE_CLIENT: 'unpause_client',
  CHAT_MESSAGE: 'chatMessage',
  CHAT_TRANSFER: 'chatTransfer',
  CHAT_CLOSE: 'chatClose',
  CHAT_PAUSE: 'chatPause',
  CHAT_UNPAUSE: 'chatUnpause',
  CHAT_SET_PAUSE: 'chatSetPause',
  CHAT_SET_UNPAUSE: 'chatSetUnpause',
  CHAT_QUEUE_STATUS: 'chatQueueStatus',
  INTERNAL_CALL: 'internalCall',
  INVITE_GROUP: 'inviteGroup',
  DISINVITE_GROUP: 'disinviteGroup',
  JOIN_GROUP: 'joinGroup',
  REFUSE_GROUP: 'refuseGroup',
  REMOVE_GROUP: 'removeGroup',
  QUIT_GROUP: 'quitGroup',
  CHAT_REMOTE_CONTROL: 'remoteControl',
  CHAR_REMOTE_CONTROL_CANCEL: 'remoteControlCancel',
} as const;

/* ======================== 脚本配置 ======================== */

const moduleVersion = '0.0.1';

const scriptUrls = [
  { url: '/sockjs.js', version: moduleVersion },
  { url: '/stomp.js', version: moduleVersion },
];

const flashScriptUrls = [
  { url: '/flashbridge/swfobject.js', version: moduleVersion },
  { url: '/flashbridge/web_socket.js', version: moduleVersion },
];

const sipScriptUrls = [
  { url: '/sipjs/adapter-latest.js', version: moduleVersion },
  { url: '/sipjs/sip-0.7.7.js', version: moduleVersion },
];

const sipAudioUrls = [
  { id: 'ringtone', url: '/sipjs/sounds/ringtone.wav', version: moduleVersion },
  { id: 'ringbacktone', url: '/sipjs/sounds/ringbacktone.wav', version: moduleVersion },
  { id: 'dtmfTone', url: '/sipjs/sounds/dtmf.wav', version: moduleVersion },
  { id: 'startTone', url: '/sipjs/sounds/start.wav', version: moduleVersion },
  { id: 'hangupTone', url: '/sipjs/sounds/hangup.wav', version: moduleVersion },
];

const cryptoJSUrls = [
  { url: '/js/CryptoJS/rollups/aes.js', version: moduleVersion },
  { url: '/js/CryptoJS/components/mode-ecb-min.js', version: moduleVersion },
  { url: '/js/CryptoJS/components/md5-min.js', version: moduleVersion },
];

/* ======================== 全局状态 ======================== */

let GLOBAL: AgentState = {
  ready: false,
  debug: false,
  sipPhone: false,
  connecting: false,
  connected: false,
  connectionCloseCount: 0,
  sessionId: '',
  lastPingTime: null,
  pingValue: false,
  pingTimer: '',
  latency: 0,
  logout: false,
  connectInterval: 1000,
  randoms: 0,
  identifier: '',
  webSocketUrl: '',
  allowBackward: true,
  answerCallsByCloseBrowser: 0,
  unbindPhoneByCloseBrowser: 0,
  breakLines: [],
};

/* ======================== Agent 对象 ======================== */

interface AgentInstance {
  sessionKey?: string;
  identifier?: string;
  enterpriseId: number;
  cno: string | number;
  bindType?: number;
  bindTel?: string | number;
  qids?: string;
  emailQids?: string;
  loginStatus?: number;
  pauseDescription?: string | null;
  webSocketUrl?: string;
  sipIp?: string;
  sipPwd?: string;
  webrtcSocketUrl?: string;
  webrtcStunServer?: string;
  webrtcAutoAnswer?: any;
  webrtcExpiresTime?: number;
  debug?: boolean;
  token?: string;
  loginType?: number;
  subQueue?: any;
  subWholeQueue?: any;
  subMonitor?: any;
  subEnterprise?: any;
  subEmail?: any;
  subChatQueue?: any;
  type?: number;
  chatLoginStatus?: number;
  chatPauseDescription?: string | null;
  chatLimitNumber?: number;
  answerCallsByCloseBrowser?: number;
  unbindPhoneByCloseBrowser?: number;
  timeStamp?: string;
  forceLoginCheck?: boolean;
}

let Agent: AgentInstance = {
  enterpriseId: 0,
  cno: '',
};

function initAgent(params: OnlineParams): AgentInstance {
  Agent = {
    sessionKey: params.sessionKey,
    identifier: params.identifier,
    enterpriseId: Number(params.enterpriseId),
    cno: params.cno,
    bindType: params.bindType,
    bindTel: params.bindTel,
    qids: params.qids,
    emailQids: params.emailQids,
    loginStatus: params.loginStatus,
    pauseDescription: params.pauseDescription,
    webSocketUrl: params.webSocketUrl,
    sipIp: params.sipIp,
    sipPwd: params.sipPwd,
    webrtcSocketUrl: params.webrtcSocketUrl,
    webrtcStunServer: params.webrtcStunServer,
    webrtcAutoAnswer: params.webrtcAutoAnswer,
    webrtcExpiresTime: params.webrtcExpiresTime,
    debug: params.debug,
    token: params.token,
    loginType: params.loginType,
    type: params.type,
    chatLoginStatus: params.chatLoginStatus,
    chatPauseDescription: params.chatPauseDescription,
    chatLimitNumber: params.chatLimitNumber,
    answerCallsByCloseBrowser: params.answerCallsByCloseBrowser,
    unbindPhoneByCloseBrowser: params.unbindPhoneByCloseBrowser,
    timeStamp: params.timeStamp,
    forceLoginCheck: params.forceLoginCheck,
  };
  return Agent;
}

/* ======================== Util ======================== */

const Util = {
  loadScript(urls: any[], i: number, callback?: () => void) {
    if (i === urls.length) {
      logger.debug('Util.loadScript: JS file is loaded [' + JSON.stringify(urls) + ']');
      if (typeof GLOBAL.callback === 'function') {
        GLOBAL.callback();
      } else if (typeof callback === 'function') {
        callback();
      }
      GLOBAL.ready = true;
      return;
    }

    const oHead = document.getElementsByTagName('head').item(0);
    const oScript = document.createElement('script');
    oScript.type = 'text/javascript';
    oScript.src = GLOBAL.webSocketUrl + urls[i].url + '?version=' + urls[i].version;
    oScript.charset = 'UTF-8';
    oHead!.appendChild(oScript);

    if ((oScript as any).readyState) {
      (oScript as any).onreadystatechange = function () {
        if (
          (oScript as any).readyState === 'loaded' ||
          (oScript as any).readyState === 'complete'
        ) {
          (oScript as any).onreadystatechange = null;
          Util.loadScript(urls, i + 1, callback);
        }
      };
    } else {
      oScript.onload = function () {
        Util.loadScript(urls, i + 1, callback);
      };
    }
  },

  loadAudio(urls: any[], i: number) {
    if (i === urls.length) {
      logger.debug('loadAudio: SipAudio file is loaded [' + JSON.stringify(urls) + ']');
      return;
    }

    const getBodyInterval = setInterval(function () {
      const oBody = window.document.getElementsByTagName('body').item(0);
      if (oBody) {
        clearInterval(getBodyInterval);

        let exist = document.getElementById('audio_remote');
        if (!exist) {
          const oAudio = document.createElement('audio');
          oAudio.id = 'audio_remote';
          oAudio.setAttribute('autoplay', 'autoplay');
          (oAudio as any).style = 'display: none';
          oBody.appendChild(oAudio);
        }

        const oHead = document.getElementsByTagName('head').item(0);
        exist = document.getElementById(urls[i].id);
        if (exist) return;

        const oScript = document.createElement('audio');
        oScript.id = urls[i].id;
        if (urls[i].id === 'ringtone' || urls[i].id === 'ringbacktone') {
          oScript.setAttribute('loop', 'loop');
        }
        oScript.setAttribute('src', GLOBAL.webSocketUrl + urls[i].url);
        oHead!.appendChild(oScript);
        oScript.addEventListener('canplaythrough', function () {
          Util.loadAudio(urls, i + 1);
        });
      }
    }, 200);
  },

  isIE: (function () {
    const browser: Record<string, any> = {};
    return function (ver?: number, c?: string) {
      const key = ver ? (c ? 'is' + c + 'IE' + ver : 'isIE' + ver) : 'isIE';
      let v = browser[key];
      if (typeof v !== 'undefined') {
        return v;
      }
      if (!ver) {
        v =
          navigator.userAgent.indexOf('MSIE') !== -1 ||
          navigator.appVersion.indexOf('Trident/') > 0;
      } else {
        const match = navigator.userAgent.match(
          /(?:MSIE |Trident\/.*; rv:|Edge\/)(\d+)/,
        );
        if (match) {
          const v1 = parseInt(match[1]);
          v = c
            ? c === 'lt'
              ? v1 < ver
              : c === 'gt'
              ? v1 > ver
              : undefined
            : v1 === ver;
        } else if (ver <= 9) {
          const b = document.createElement('b');
          b.innerHTML =
            '<!--[if ' +
            (c ? c : '') +
            ' IE ' +
            ver +
            ']><i></i><![endif]-->';
          v = b.getElementsByTagName('i').length === 1;
        } else {
          v = undefined;
        }
      }
      browser[key] = v;
      return v;
    };
  })(),

  randomNumber(n: number) {
    return Math.floor(Math.random() * n + 5);
  },

  isFunction(arg: any): arg is (...args: any[]) => any {
    return typeof arg === 'function';
  },
  isNumber(arg: any): arg is number {
    return typeof arg === 'number';
  },
  isUndefined(arg: any): arg is undefined {
    return arg === void 0;
  },
  isEmpty(arg: any) {
    return JSON.stringify(arg) === '{}';
  },

  randomString(length: number) {
    let rdmString = '';
    while (rdmString.length < length) {
      rdmString += Math.random().toString(36).substr(2);
    }
    return rdmString.substr(0, length);
  },

  generateSessionId() {
    GLOBAL.sessionId = Util.randomString(10);
    return GLOBAL.sessionId;
  },

  ajax(params: any) {
    params = params || {};
    params.data = params.data || {};

    switch (params.dataType) {
      case 'jsonp':
        jsonp(params);
        break;
      case 'json':
        json(params);
        break;
      default:
        logger.error('function ajax only support json and jsonp dataType!');
        break;
    }

    function json(params: any) {
      params.type = (params.type || 'GET').toUpperCase();
      params.data = formatParams(params.data);
      let xhr: any = null;
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else {
        xhr = new (window as any).ActiveXObject('Microsoft.XMLHTTP');
      }

      xhr.onReadyStateChange = function () {
        if (xhr.readyState === 4) {
          const status = xhr.status;
          if (status >= 200 && status < 300) {
            let response = '';
            const type = xhr.getResponseHeader('Content-type');
            if (type.indexOf('xml') !== -1 && xhr.responseXML) {
              response = xhr.responseXML;
            } else if (type === 'application/json') {
              if ((window as any).JSON) {
                response = JSON.parse(xhr.responseText);
              } else {
                response = eval('(' + xhr.responseText + ')');
              }
            } else {
              response = xhr.responseText;
            }
            params.success && params.success(response);
          } else {
            params.error && params.error(status);
          }
        } else {
          logger.debug('state: ' + xhr.readyState);
        }
      };

      switch (params.type) {
        case 'GET':
          xhr.open(params.type, params.url + '?' + params.data, true);
          xhr.send(null);
          break;
        case 'POST':
          xhr.open(params.type, params.url, true);
          xhr.setRequestHeader(
            'Content-Type',
            'application/x-www-form-urlencoded; charset=UTF-8',
          );
          xhr.send(params.data);
          break;
        default:
          logger.error('function json only support GET and POST type!');
          break;
      }
    }

    function jsonp(params: any) {
      const callbackName = params.jsonp + '_' + new Date().getTime();
      const head = document.getElementsByTagName('head')[0];
      params.data['callback'] = callbackName;
      const data = formatParams(params.data);
      const script = document.createElement('script');
      head.appendChild(script);

      (window as any)[callbackName] = function (json: any) {
        head.removeChild(script);
        clearTimeout((script as any).timer);
        (window as any)[callbackName] = null;
        params.success && params.success(json);
      };

      script.src = params.url + '?' + data;

      if (params.time) {
        (script as any).timer = setTimeout(function () {
          (window as any)[callbackName] = null;
          head.removeChild(script);
          params.error &&
            params.error({
              message: 'jsonp request time out!',
            });
        }, params.time);
      }
    }

    function formatParams(data: any) {
      const arr: string[] = [];
      for (const name in data) {
        if (data.hasOwnProperty(name)) {
          arr.push(name + '=' + data[name]);
        }
      }
      arr.push('t=' + new Date().getTime());
      return arr.join('&');
    }
  },
};


/* ======================== WebSocketClient ======================== */

let stompClient: any = null;

const WebSocketClient = {
  options: {
    OnOpen(token?: any) {},
    OnMessage(token: any) {},
    OnClose(token?: any) {},
  },

  connect() {
    if (GLOBAL.connecting) {
      logger.warn('WebSocketClient.connect: connecting!');
      return;
    }
    GLOBAL.connecting = true;
    logger.debug('WebSocketClient.connect: connecting...');

    setTimeout(function () {
      GLOBAL.connecting = false;
    }, GLOBAL.connectInterval);

    let socketUrl: string;

    if (
      Util.isUndefined(Agent.webSocketUrl) ||
      Agent.webSocketUrl === ''
    ) {
      if (GLOBAL.webSocketUrl.indexOf('/', 10) > 0) {
        socketUrl = GLOBAL.webSocketUrl.substring(
          0,
          GLOBAL.webSocketUrl.indexOf('/', 10),
        );
      } else {
        socketUrl = GLOBAL.webSocketUrl;
      }
    } else {
      socketUrl = Agent.webSocketUrl!;
    }

    if (socketUrl.toLocaleLowerCase().indexOf('http') === -1) {
      socketUrl = (location.protocol || 'http:') + '//' + socketUrl;
    }

    if (typeof SockJS === 'undefined') {
      logger.error('WebSocketClient.connect: SockJS object is undefined');
      return;
    }
    if (typeof Stomp === 'undefined') {
      logger.error('WebSocketClient.connect: Stomp object is undefined');
      return;
    }

    if (Util.isIE()) {
      socketUrl = socketUrl + '/agent?token=' + Agent.token;
    } else {
      socketUrl = socketUrl + '/agent';
    }

    GLOBAL.sessionId = Util.randomString(10);

    const sockOptions: any = {};
    sockOptions.sessionId = Util.generateSessionId;
    if (!GLOBAL.allowBackward) {
      sockOptions.transports = 'websocket';
    }
    const socket = new SockJS(socketUrl, {}, sockOptions);

    stompClient = Stomp.over(socket);
    stompClient.debug = function (message: string) {};

    stompClient.connect(
      {},
      function () {
        if (GLOBAL.connected) {
          logger.warn('WebSocketClient.connect: had bean connected!');
          return;
        }
        logger.debug('WebSocketClient.connect: connect success!');
        if (typeof WebSocketClient.options.OnOpen === 'function') {
          WebSocketClient.options.OnOpen();
        }

        stompClient.subscribe('/user/agent', function (data: any) {
          const response = JSON.parse(data.body);
          if (typeof WebSocketClient.options.OnMessage === 'function') {
            WebSocketClient.options.OnMessage(response);
          }
          WebSocketClient.processToken(response);
        });

        if (
          !Util.isUndefined(Agent.emailQids) &&
          Agent.emailQids !== ''
        ) {
          stompClient.subscribe(
            '/email/' + Agent.emailQids,
            function (data: any) {
              const response = JSON.parse(data.body);
              if (typeof WebSocketClient.options.OnMessage === 'function') {
                WebSocketClient.options.OnMessage(response);
              }
              WebSocketClient.processToken(response);
            },
          );
        }

        WebSocketClient.login();
        GLOBAL.connected = true;
        GLOBAL.connecting = false;
      },
      function (error: any) {
        if (typeof WebSocketClient.options.OnClose === 'function') {
          WebSocketClient.options.OnClose();
        }
        GLOBAL.connected = false;
        GLOBAL.connecting = false;
        logger.error('错误码为:' + error.code);
        logger.error(error);
      },
    );
  },

  disconnect() {
    if (stompClient) {
      stompClient.disconnect(function () {
        GLOBAL.connected = false;
      });
    }
  },

  sendToken(token: any, headers?: any) {
    headers = headers === null ? {} : headers;
    stompClient.send(
      '/app/agent/handle/' + token.type,
      headers,
      JSON.stringify(token),
    );
  },

  processToken(token: TokenMessage) {
    if (token.type === 'response') {
      ResponseHandler.clientResponseHandler(token);
      if (token.reqType === RESPONSE_TYPE.LOGIN) {
        logger.debug(
          'WebSocketClient.processToken: login [GLOBAL.sessionId=' +
            GLOBAL.sessionId +
            '][token.values.sessionId=' +
            token.values?.sessionId +
            ']',
        );
        if (token.values?.sessionId !== null && GLOBAL.sessionId !== token.values?.sessionId) {
          return;
        }
        const agentData: any = {};
        agentData.enterpriseId = Agent.enterpriseId;
        agentData.cno = Agent.cno;
        agentData.loginStatus = Agent.loginStatus;
        agentData.pauseDescription = Agent.pauseDescription;
        agentData.bindTel = Agent.bindTel;
        agentData.bindType = Agent.bindType;
        agentData.qids = Agent.qids;
        agentData.webSocketUrl = Agent.webSocketUrl;
        agentData.token = Agent.token;
        token.agent = agentData;
      }
      ResponseHandler.invoke(token.reqType!, token);
    } else if (token.type === 'event') {
      if (token.event === 'kickout') {
        logger.debug(
          'WebSocketClient.processToken: kickout [GLOBAL.sessionId=' +
            GLOBAL.sessionId +
            '][token.sessionId=' +
            token.sessionId +
            ']',
        );
        if (GLOBAL.sessionId !== token.sessionId) {
          GLOBAL.logout = true;
          GLOBAL.connected = false;
          this.disconnect();
          if (Agent.bindType === 3) {
            SipPhone.disconnect();
          }
          EventSystem.invoke(EVENT_TYPE.KICKOUT, token);
        }
        return;
      } else if (token.event === 'debug') {
        if ((token as any).debug === '1') {
          Agent.debug = true;
        } else {
          Agent.debug = false;
        }
        return;
      } else if (token.event === 'status') {
        if (
          token.enterpriseId !== Agent.enterpriseId ||
          token.cno !== Agent.cno
        ) {
          EventSystem.invoke('queueStatus', token);
          return;
        }
        if (token.code === 'OFFLINE') {
          let disconnect = true;
          if (token.loginType === 1 || token.loginType === 2) {
            if (token.loginType === token.logoutType) {
              disconnect = false;
            }
          }
          if (disconnect) {
            CallConnect.disconnect();
          }
        }
        if (token.code === 'IDLE' || token.code === 'PAUSE') {
          Agent.loginStatus = token.loginStatus as number;
          if (token.pauseDescription !== undefined) {
            Agent.pauseDescription = token.pauseDescription;
          } else {
            Agent.pauseDescription = null;
          }
        }
      } else if (token.event === 'chatStatus') {
        if (
          token.enterpriseId !== Agent.enterpriseId ||
          token.cno !== Agent.cno
        ) {
          EventSystem.invoke('chatQueueStatus', token);
          return;
        }
        if (token.action === 'pause' || token.action === 'unpause') {
          Agent.chatLoginStatus = token.loginStatus as number;
          Agent.chatPauseDescription = token.pauseDescription || null;
        }
      }

      EventSystem.callSessionHandler(token);
      EventSystem.invoke(token.event, token);
    } else {
      logger.debug(JSON.stringify(token));
    }
  },

  chatSendToken(token: any, headers?: any) {
    headers = headers === null ? {} : headers;
    stompClient.send(
      '/app/chat/handle/' + token.type,
      headers,
      JSON.stringify(token),
    );
  },

  emailSendToken(token: any, headers?: any) {
    headers = headers === null ? {} : headers;
    stompClient.send(
      '/app/email/handle/' + token.type,
      headers,
      JSON.stringify(token),
    );
  },

  login() {
    this.sendToken({
      type: 'login',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      loginStatus: Agent.loginStatus,
      bindTel: Agent.bindTel,
      bindType: Agent.bindType,
      pauseDescription: Agent.pauseDescription,
      webSocketUrl: GLOBAL.webSocketUrl,
      loginType: Agent.loginType,
      chatPauseDescription: Agent.chatPauseDescription,
      chatLimitNumber: Agent.chatLimitNumber,
      chatLoginStatus: Agent.chatLoginStatus,
      timeStamp: Agent.timeStamp,
      forceLoginCheck: Agent.forceLoginCheck,
    });
  },

  debug(params: { message: string }) {
    this.sendToken({
      type: 'debug',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      message: params.message,
    });
  },

  subscribeQueue() {
    if (!Util.isUndefined(Agent.qids) && Agent.qids !== '') {
      if (Agent.subQueue != null) {
        logger.error('ClinkAgent.subscribeQueue: 所属队列订阅已存在');
        return;
      }
      if (Agent.subWholeQueue != null) {
        logger.error('ClinkAgent.subscribeQueue: 全部队列订阅已存在');
        return;
      }
      const subQueue = stompClient.subscribe(
        '/queue/' + Agent.qids,
        function (data: any) {
          const response = JSON.parse(data.body);
          if (typeof WebSocketClient.options.OnMessage === 'function') {
            WebSocketClient.options.OnMessage(response);
          }
          WebSocketClient.processToken(response);
        },
      );
      Agent.subQueue = subQueue;
      logger.debug('ClinkAgent.subscribeQueue: 所属队列订阅成功');
    }
  },

  unsubscribeQueue() {
    if (Agent.subQueue != null) {
      Agent.subQueue.unsubscribe();
      Agent.subQueue = null;
      logger.debug('ClinkAgent.unsubscribeQueue: 所属队列订阅取消');
    } else {
      logger.error('ClinkAgent.unsubscribeQueue: 所属队列订阅不存在');
    }
  },

  subscribeWholeQueue() {
    if (
      !Util.isUndefined(Agent.enterpriseId) &&
      Agent.enterpriseId !== 0
    ) {
      if (Agent.subWholeQueue != null) {
        logger.error('ClinkAgent.subscribeWholeQueue: 全部队列订阅已存在');
        return;
      }
      if (Agent.subQueue != null) {
        logger.error('ClinkAgent.subscribeWholeQueue: 所属队列订阅已存在');
        return;
      }
      const subQueue = stompClient.subscribe(
        '/queue/' + Agent.enterpriseId,
        function (data: any) {
          const response = JSON.parse(data.body);
          if (typeof WebSocketClient.options.OnMessage === 'function') {
            WebSocketClient.options.OnMessage(response);
          }
          WebSocketClient.processToken(response);
        },
      );
      Agent.subWholeQueue = subQueue;
      logger.debug('ClinkAgent.subscribeWholeQueue: 全部队列订阅成功');
    }
  },

  unsubscribeWholeQueue() {
    if (Agent.subWholeQueue != null) {
      Agent.subWholeQueue.unsubscribe();
      Agent.subWholeQueue = null;
      logger.debug('ClinkAgent.unsubscribeWholeQueue: 全部队列订阅取消');
    } else {
      logger.error('ClinkAgent.unsubscribeWholeQueue: 队列订阅不存在');
    }
  },

  subscribeMonitor() {
    if (!Util.isUndefined(Agent.qids) && Agent.qids !== '') {
      if (Agent.subMonitor != null) {
        logger.error('ClinkAgent.subscribeMonitor: 监控订阅已存在');
      } else {
        const subMonitor = stompClient.subscribe(
          '/monitor/' + Agent.qids,
          function (data: any) {
            const response = JSON.parse(data.body);
            if (typeof WebSocketClient.options.OnMessage === 'function') {
              WebSocketClient.options.OnMessage(response);
            }
            WebSocketClient.processToken(response);
          },
        );
        Agent.subMonitor = subMonitor;
      }
    }
  },

  unsubscribeMonitor() {
    if (Agent.subMonitor != null) {
      Agent.subMonitor.unsubscribe();
      Agent.subMonitor = null;
    } else {
      logger.error('ClinkAgent.unsubscribeQueue: 监控订阅不存在');
    }
  },

  subscribeEnterprise() {
    if (
      !Util.isUndefined(Agent.enterpriseId) &&
      Agent.enterpriseId !== 0
    ) {
      if (Agent.subEnterprise != null) {
        logger.error('ClinkAgent.subscribeEnterprise: 企业订阅已存在');
      } else {
        const subEnterprise = stompClient.subscribe(
          '/enterprise/' + Agent.enterpriseId,
          function (data: any) {
            const response = JSON.parse(data.body);
            if (typeof WebSocketClient.options.OnMessage === 'function') {
              WebSocketClient.options.OnMessage(response);
            }
            WebSocketClient.processToken(response);
          },
        );
        Agent.subEnterprise = subEnterprise;
      }
    }
  },

  unsubscribeEnterprise() {
    if (Agent.subEnterprise != null) {
      Agent.subEnterprise.unsubscribe();
      Agent.subEnterprise = null;
    } else {
      logger.error('ClinkAgent.unsubscribeEnterprise: 企业订阅不存在');
    }
  },

  subscribeEmail() {
    if (
      !Util.isUndefined(Agent.emailQids) &&
      Agent.emailQids !== ''
    ) {
      if (Agent.subEmail != null) {
        logger.error('ClinkAgent.subscribeEmail: 邮件队列订阅已存在');
      } else {
        const subQueue = stompClient.subscribe(
          '/email/' + Agent.emailQids,
          function (data: any) {
            const response = JSON.parse(data.body);
            if (typeof WebSocketClient.options.OnMessage === 'function') {
              WebSocketClient.options.OnMessage(response);
            }
            WebSocketClient.processToken(response);
          },
        );
        Agent.subEmail = subQueue;
      }
    }
  },

  subscribeChatQueue() {
    if (!Util.isUndefined(Agent.qids) && Agent.qids !== '') {
      if (Agent.subChatQueue != null) {
        logger.error('ClinkAgent.subscribeChatQueue: 在线客服队列订阅已存在');
      } else {
        const subChatQueue = stompClient.subscribe(
          '/chatQueue/' + Agent.qids,
          function (data: any) {
            const response = JSON.parse(data.body);
            if (typeof WebSocketClient.options.OnMessage === 'function') {
              WebSocketClient.options.OnMessage(response);
            }
            WebSocketClient.processToken(response);
          },
        );
        Agent.subChatQueue = subChatQueue;
      }
    }
  },

  unsubscribeChatQueue() {
    if (Agent.subChatQueue != null) {
      Agent.subChatQueue.unsubscribe();
      Agent.subChatQueue = null;
    }
  },
};

/* ======================== SipPhone ======================== */

let sipPhoneInstance: any = null;
let currentSession: any = undefined;
let autoAnswerTimeout: any;

const SipPhone = {
  sipRegister() {
    if (sipPhoneInstance && sipPhoneInstance.isRegistered()) {
      logger.info('SipPhone.sipRegister sipPhone is exist and registered return');
      return;
    }

    let level = 1;
    if (GLOBAL.debug) {
      level = 2;
    }

    try {
      sipPhoneInstance = new SIP.UA({
        uri:
          'sip:' +
          Agent.enterpriseId +
          Agent.bindTel +
          '@' +
          Agent.sipIp,
        wsServers: [Agent.webrtcSocketUrl],
        authorizationUser:
          Agent.enterpriseId + (Agent.bindTel as any).toString(),
        password: Agent.sipPwd,
        register: true,
        stunServers: '',
        turnServers: Agent.webrtcStunServer,
        traceSip: true,
        wsServerMaxReconnection: 3,
        wsServerReconnectionTimeout: 4,
        iceCheckingTimeout: 1000,
        hackIpInContact: true,
        log: { level: level },
        registerExpires: Agent.webrtcExpiresTime,
      });
    } catch (e) {
      logger.error(e);
    }

    if (!sipPhoneInstance) {
      logger.error('SipPhone.sipRegister sipPhone is null');
      return;
    }

    sipPhoneInstance.on('disconnected', function (transport: any) {
      sipEventHandler({ name: 'disconnected', transport });
    });

    sipPhoneInstance.on('connected', function (transport: any) {
      sipEventHandler({ name: 'connected', transport });
    });

    sipPhoneInstance.on('invite', function (session: any) {
      sipEventHandler({ name: 'invite' });

      let autoAnswer = 0;
      let delay = 500;
      if (
        session.transaction.request.headers['X-Asterisk-Call-Type'] !== undefined
      ) {
        const callType =
          session.transaction.request.headers['X-Asterisk-Call-Type'][0].raw;
        let detailCallType: any;

        if (
          session.transaction.request.headers[
            'X-Asterisk-Detail-Call-Type'
          ] !== undefined
        ) {
          try {
            detailCallType =
              session.transaction.request.headers[
                'X-Asterisk-Detail-Call-Type'
              ][0].raw;
          } catch (e) {}
        }

        logger.debug(
          'Event.sipEventHandler: invite callType: ' +
            callType +
            ' detailCallType: ' +
            detailCallType,
        );

        const autoAnswerMap = Agent.webrtcAutoAnswer;
        if (callType === '1') {
          if (detailCallType) {
            autoAnswer = autoAnswerMap[detailCallType];
            if (autoAnswerMap['delay']) {
              delay = autoAnswerMap['delay'];
            }
          }
        }
        if (
          callType === '2' ||
          callType === '4' ||
          callType === '5' ||
          callType === '9'
        ) {
          autoAnswer = autoAnswerMap[callType];
          if (detailCallType) {
            if (detailCallType === '202' || detailCallType === '203') {
              autoAnswer = autoAnswerMap[detailCallType];
            }
          }
        }
      }

      if (autoAnswer === 1) {
        autoAnswerTimeout = setTimeout(function () {
          try {
            (window as any).startTone.play();
          } catch (e) {}
          session.accept({
            media: {
              constraints: { audio: true, video: false },
              render: { remote: document.getElementById('audio_remote') },
            },
          });
        }, delay);
        if (delay > 500) {
          startRingTone();
        }
      } else {
        startRingTone();
      }

      currentSession = session;

      session.on('connecting', function () {
        stopRingTone();
      });
      session.on('accepted', function () {
        stopRingTone();
      });
      session.on('failed', function () {
        sipEventHandler({ name: 'failed' });
        stopRingTone();
        currentSession = undefined;
      });
      session.on('cancel', function () {
        sipEventHandler({ name: 'cancel' });
        stopRingTone();
        currentSession = undefined;
      });
      session.on('bye', function () {
        sipEventHandler({ name: 'bye' });
        if (autoAnswerTimeout) {
          clearTimeout(autoAnswerTimeout);
        }
        currentSession = undefined;
        try {
          (window as any).hangupTone.play();
        } catch (e) {}
      });
      session.on('rejected', function () {
        currentSession = undefined;
      });
      session.on('terminated', function () {
        currentSession = undefined;
      });
    });
  },

  isRegistered() {
    if (!sipPhoneInstance) {
      logger.error('SipPhone.isRegistered sipPhone is null');
      return false;
    }
    return sipPhoneInstance.isRegistered();
  },

  sipUnRegister() {
    if (!sipPhoneInstance) {
      logger.error('SipPhone.sipUnRegister sipPhone is null');
      return;
    }
    sipPhoneInstance.stop();
  },

  disconnect() {
    if (!sipPhoneInstance) {
      logger.error('SipPhone.disconnect sipPhone is null');
      return;
    }
    sipPhoneInstance.transport.disconnect();
  },

  sipCall(number: string) {
    if (!sipPhoneInstance) {
      logger.error('SipPhone.sipCall sipPhone is null');
      return;
    }
    const session = sipPhoneInstance.invite(
      number,
      document.getElementById('audio_remote'),
    );

    sipEventHandler({ name: 'invite' });
    currentSession = session;
    session.on('connecting', function () {
      stopRingTone();
    });
    session.on('accepted', function () {
      stopRingTone();
    });
    session.on('failed', function () {
      sipEventHandler({ name: 'failed' });
      stopRingTone();
      currentSession = undefined;
    });
    session.on('cancel', function () {
      sipEventHandler({ name: 'cancel' });
      stopRingTone();
      currentSession = undefined;
    });
    session.on('bye', function () {
      sipEventHandler({ name: 'bye' });
      currentSession = undefined;
      try {
        (window as any).hangupTone.play();
      } catch (e) {}
    });
    session.on('rejected', function () {
      currentSession = undefined;
    });
    session.on('terminated', function () {
      currentSession = undefined;
    });
  },

  sipAnswer() {
    if (autoAnswerTimeout) {
      clearTimeout(autoAnswerTimeout);
    }
    currentSession.accept({
      media: {
        constraints: { audio: true, video: false },
        render: { remote: document.getElementById('audio_remote') },
      },
    });
  },

  sipHangup() {
    currentSession.terminate();
  },

  sipReject() {
    if (autoAnswerTimeout) {
      clearTimeout(autoAnswerTimeout);
    }
    currentSession.reject();
  },

  sendDTMF(value: string) {
    if (currentSession !== undefined) {
      currentSession.dtmf(value);
      try {
        (window as any).dtmfTone.play();
      } catch (e) {}
    }
  },
};

function sipEventHandler(token: { name: string; transport?: any }) {
  let objMsg: any;
  switch (token.name) {
    case 'invite':
      if (!CallSession.isSessionAlive()) {
        logger.debug('Event.sipEventHandler: invite');
        CallSession.init();
      }
      break;
    case 'disconnected':
      logger.debug('Event.sipEventHandler: disconnected');
      CallSession.terminate();
      objMsg = {
        type: 'event',
        event: EVENT_TYPE.SIP_DISCONNECTED,
        enterpriseId: Agent.enterpriseId,
        cno: Agent.cno,
        code: -1,
        scope: 'agent',
      };
      EventSystem.invoke(EVENT_TYPE.SIP_DISCONNECTED, objMsg);
      break;
    case 'connected':
      logger.debug('Event.sipEventHandler: connected');
      objMsg = {
        type: 'event',
        event: EVENT_TYPE.SIP_CONNECTED,
        enterpriseId: Agent.enterpriseId,
        cno: Agent.cno,
        code: 0,
        scope: 'agent',
      };
      EventSystem.invoke(EVENT_TYPE.SIP_CONNECTED, objMsg);
      break;
    case 'failed':
    case 'cancel':
    case 'bye':
      if (CallSession.isSessionAlive()) {
        logger.debug('Event.sipEventHandler: bye');
        CallSession.terminate();
      }
      break;
  }
}

function startRingTone() {
  try {
    (window as any).ringtone.play();
  } catch (e) {}
}
function stopRingTone() {
  try {
    (window as any).ringtone.pause();
  } catch (e) {}
}

/* ======================== CallSession ======================== */

const CallSession = {
  alive: false,
  init() {
    logger.debug('Session.init: session建立');
    this.alive = true;
  },
  terminate() {
    logger.debug('Session.terminate: session销毁');
    this.alive = false;
  },
  isSessionAlive() {
    return this.alive;
  },
};

/* ======================== EventSystem ======================== */

const EventSystem = {
  callSessionHandler(token: TokenMessage) {
    if (token.event === 'status') {
      if (token.deviceStatus === 3 || token.deviceStatus === 4) {
        if (!CallSession.isSessionAlive()) {
          CallSession.init();
        }
      }
      if (
        token.deviceStatus === 9 ||
        token.deviceStatus === 0 ||
        token.deviceStatus === 1
      ) {
        if (CallSession.isSessionAlive()) {
          CallSession.terminate();
        }
      }
    } else if (token.event === 'kickout') {
      if (CallSession.isSessionAlive()) {
        CallSession.terminate();
      }
      const params: any = {};
      params.logoutMode = 0;
      ClinkClient.logout(params);
    }
  },

  eventListeners: {} as Record<string, EventListener>,

  registerListener(type: string, listener: EventListener) {
    if (Util.isUndefined(listener)) return;
    if (!Util.isFunction(listener)) throw TypeError('listener must be a function');
    this.eventListeners[type] = listener;
  },

  removeListener(type: string) {
    if (this.eventListeners && this.eventListeners[type]) {
      delete this.eventListeners[type];
    } else {
      logger.warn('Event.removeListener failed: there is not event: [' + type + ']');
    }
  },

  invoke(type: string, token: TokenMessage) {
    if (Util.isFunction(this.eventListeners[type])) {
      this.eventListeners[type](token);
    } else {
      logger.debug('Event.invoke failed: there is not event: [' + type + ']');
    }
  },
};

/* ======================== ResponseHandler ======================== */

const ResponseHandler = {
  defaultType: {
    login: 'login',
    kickout: 'kickout',
    logout: 'logout',
    changeBindTel: 'changeBindTel',
    ping: 'ping',
  },

  clientResponseHandler(token: TokenMessage) {
    switch (token.reqType) {
      case this.defaultType.login:
        if (
          token.code === 0 &&
          (token.values?.sessionId === null || GLOBAL.sessionId === token.values?.sessionId)
        ) {
          if (token.isAgentDebug === '1') {
            (GLOBAL as any).isDebug = true;
          }
          if (GLOBAL.pingTimer !== '' && GLOBAL.pingTimer !== 'undefined') {
            clearTimeout(GLOBAL.pingTimer);
            GLOBAL.pingTimer = '';
          }
          CallConnect.ping();
          if (token.values?.bindType === 3 && token.loginStatus !== -1) {
            Agent.sipIp = token.values.sipIp;
            Agent.sipPwd = token.values.sipPwd;
            Agent.webrtcSocketUrl = token.values.webrtcSocketUrl;
            Agent.webrtcStunServer = token.values.webrtcStunServer;
            Agent.webrtcAutoAnswer = token.values.webrtcAutoAnswer;
            Agent.webrtcExpiresTime = token.values.expiresTime;
            SipPhone.sipRegister();
            let st = 1;
            const setSipIntervalId = setInterval(function () {
              st++;
              if (SipPhone.isRegistered()) {
                clearInterval(setSipIntervalId);
                EventSystem.invoke(EVENT_TYPE.SIP_REGISTERED, {
                  type: 'event',
                  code: 0,
                  msg: 'success',
                  event: EVENT_TYPE.SIP_REGISTERED,
                  enterpriseId: Agent.enterpriseId,
                  cno: Agent.cno,
                  scope: 'agent',
                } as TokenMessage);
              }
              if (st === 20) {
                clearInterval(setSipIntervalId);
                EventSystem.invoke(EVENT_TYPE.SIP_REGISTERED, {
                  type: 'event',
                  code: -1,
                  msg: 'fail',
                  event: EVENT_TYPE.SIP_REGISTERED,
                  enterpriseId: Agent.enterpriseId,
                  cno: Agent.cno,
                  scope: 'agent',
                } as TokenMessage);
                logger.debug('软电话注册失败, 请退出重新登录');
              }
            }, 500);
          }
        } else {
          if (token.values?.sessionId === null || GLOBAL.sessionId === token.values?.sessionId) {
            CallConnect.close();
          }
        }
        break;
      case this.defaultType.kickout:
      case this.defaultType.logout:
        if (token.code === 0) {
          if (
            token.values &&
            token.values.enterpriseId === Agent.enterpriseId &&
            token.values.cno === Agent.cno
          ) {
            CallConnect.close();
            GLOBAL.logout = true;
          }
        }
        break;
      case this.defaultType.changeBindTel:
        Agent.bindTel = token.bindTel;
        Agent.bindType = token.bindType;
        break;
      case this.defaultType.ping:
        GLOBAL.pingValue = true;
        if (GLOBAL.pingTimer !== '' && GLOBAL.pingTimer !== 'undefined') {
          clearTimeout(GLOBAL.pingTimer);
          GLOBAL.pingTimer = '';
        }
        GLOBAL.pingTimer = setTimeout(function () {
          CallConnect.ping();
        }, 30000);
        GLOBAL.latency = new Date().getTime() - (GLOBAL.lastPingTime || 0);
        token.latency = GLOBAL.latency;
        break;
    }
  },

  responseCallbacks: {} as Record<string, ResponseCallback>,

  registerCallback(type: string, callback: ResponseCallback) {
    if (Util.isUndefined(callback)) return;
    if (!Util.isFunction(callback)) throw TypeError('callback must be a function!');
    this.responseCallbacks[type] = callback;
  },

  removeCallBack(type: string) {
    if (this.responseCallbacks && this.responseCallbacks[type]) {
      delete this.responseCallbacks[type];
    } else {
      logger.warn('Response.removeCallBack failed: there is not response: [' + type + ']');
    }
  },

  invoke(type: string, token: TokenMessage) {
    if (Util.isFunction(this.responseCallbacks[type])) {
      this.responseCallbacks[type](token);
    } else {
      if (!(this.defaultType as any)[type]) {
        logger.debug('Response.invoke failed: there is not response: [' + type + ']');
      }
    }
  },
};

/* ======================== CallConnect ======================== */

const CallConnect = {
  close() {
    logger.debug('CallConnect.close: 关闭连接');
    if (GLOBAL.pingTimer !== '' && GLOBAL.pingTimer !== 'undefined') {
      clearTimeout(GLOBAL.pingTimer);
      GLOBAL.pingTimer = '';
    }
    if (Agent.bindType === 3) {
      SipPhone.sipUnRegister();
    }
    if (WebSocketClient !== null) {
      WebSocketClient.disconnect();
    }
  },

  disconnect() {
    logger.debug('CallConnect.disconnect: 断开连接');
    if (GLOBAL.pingTimer !== '' && GLOBAL.pingTimer !== 'undefined') {
      clearTimeout(GLOBAL.pingTimer);
      GLOBAL.pingTimer = '';
    }
    if (Agent.bindType === 3) {
      SipPhone.disconnect();
    }
    if (WebSocketClient !== null) {
      WebSocketClient.disconnect();
    }
  },

  ping(options?: any) {
    let lEcho = true;
    if (options) {
      if (options.echo) {
        lEcho = true;
      }
    }
    GLOBAL.lastPingTime = new Date().getTime();
    WebSocketClient.sendToken(
      {
        type: 'ping',
        enterpriseId: Agent.enterpriseId,
        cno: Agent.cno,
        echo: lEcho,
      },
      options,
    );
  },

  autoReconnect() {
    GLOBAL.connected = false;
    GLOBAL.connectionCloseCount++;

    if (GLOBAL.connectionCloseCount >= 10) {
      logger.debug(
        'CallConnect.autoReconnect: 自动重连尝试已经达到最大次数' +
          GLOBAL.connectionCloseCount +
          ',请手动重连或联系管理员',
      );
      return;
    }

    logger.debug(
      'CallConnect.autoReconnect: 系统正在第' +
        GLOBAL.connectionCloseCount +
        '次尝试连接...',
    );

    const randomNumber = Util.randomNumber(5);
    const initRandomNumber = randomNumber;
    const initTimestamp = new Date().getTime();

    const intervalId = setInterval(function () {
      const objMsg: any = {
        type: 'event',
        event: 'breakLine',
        enterpriseId: Agent.enterpriseId,
        cno: Agent.cno,
        msg: 'close',
        attempts: GLOBAL.connectionCloseCount,
        randoms: randomNumber,
        code: -1,
        scope: 'agent',
        sessionId: GLOBAL.sessionId,
      };

      EventSystem.invoke(EVENT_TYPE.BREAK_LINE, objMsg);

      if (--objMsg.randoms <= 0) {
        objMsg.randoms = initRandomNumber;
        objMsg.timestamp = initTimestamp;
        GLOBAL.breakLines.push(objMsg);
        clearInterval(intervalId);
        const params: any = {
          enterpriseId: Agent.enterpriseId,
          cno: Agent.cno,
          loginStatus: Agent.loginStatus,
          loginType: Agent.loginType,
          pauseDescription: Agent.pauseDescription,
          bindTel: Agent.bindTel,
          bindType: Agent.bindType,
          qids: Agent.qids,
          emailQids: Agent.emailQids,
          webSocketUrl: Agent.webSocketUrl,
          token: Agent.token,
          chatLoginStatus: Agent.chatLoginStatus,
          chatPauseDescription: Agent.chatPauseDescription,
          answerCallsByCloseBrowser: Agent.answerCallsByCloseBrowser,
          unbindPhoneByCloseBrowser: Agent.unbindPhoneByCloseBrowser,
          timeStamp: new Date().getTime().toString(),
        };
        ClinkClient.online(params);
      }
    }, 1000);
  },
};


/* ======================== ClinkClient ======================== */

const ClinkClient = {
  WsConstant: {
    getWebSocketUrl() {
      return GLOBAL.webSocketUrl;
    },
  },

  setup(params: { debug?: boolean; sipPhone?: boolean; connectInterval?: number }, callback?: () => void) {
    if (params.debug) {
      GLOBAL.debug = true;
    }
    logger.debug('ClinkAgent.setup: ' + JSON.stringify(params));

    if (params.sipPhone && !Util.isIE()) {
      logger.debug('ClinkAgent.setup: load sip js&audio');
      if (GLOBAL.ready) {
        GLOBAL.callback = callback;
        Util.loadScript(sipScriptUrls, 0);
      } else {
        Util.loadScript(sipScriptUrls, 0, callback);
      }
      Util.loadAudio(sipAudioUrls, 0);
    } else {
      if (GLOBAL.ready) {
        callback && callback();
      } else {
        GLOBAL.callback = callback;
      }
    }

    if (params.connectInterval && Util.isNumber(params.connectInterval) && params.connectInterval > 500) {
      GLOBAL.connectInterval = params.connectInterval;
    }
  },

  login(params: LoginParams) {
    params.cno = params.cno.toString();
    if (!params.identifier) {
      params.identifier = GLOBAL.identifier;
    }

    Util.ajax({
      type: 'GET',
      url: GLOBAL.webSocketUrl + '/login',
      dataType: 'jsonp',
      data: {
        identifier: params.identifier,
        cno: params.cno,
        password: encodeURIComponent(params.password || ''),
      },
      jsonp: 'callback',
      success: function (result: any) {
        if (result.code === 0) {
          const onlineParams: OnlineParams = {
            identifier: params.identifier || GLOBAL.identifier,
            enterpriseId: result.data.enterpriseId,
            cno: params.cno,
            qids: result.data.qids,
            emailQids: result.data.emailQids,
            webSocketUrl: result.data.webSocketUrl,
            token: result.data.token,
            allowBackward: result.data.allowBackward,
            answerCallsByCloseBrowser: result.data.answerCallsByCloseBrowser,
            unbindPhoneByCloseBrowser: result.data.unbindPhoneByCloseBrowser,
          };

          if (document.location.protocol === 'https:') {
            onlineParams.webSocketUrl = (onlineParams.webSocketUrl || '').replace('http:', 'https:');
          }

          if (params.forceLoginCheck === undefined) {
            params.forceLoginCheck = false;
          }
          if (typeof params.forceLoginCheck === 'string') {
            params.forceLoginCheck = Boolean(params.forceLoginCheck);
          }
          if (params.bindType !== undefined && typeof params.bindType === 'string') {
            params.bindType = Number(params.bindType);
          }
          if (params.type !== undefined && typeof params.type === 'string') {
            params.type = Number(params.type);
          }

          onlineParams.timeStamp = new Date().getTime().toString();
          ClinkClient.online(onlineParams);
        } else {
          logger.error(JSON.stringify(result));
          result.code = -1;
          result.reqType = RESPONSE_TYPE.LOGIN;
          result.type = 'response';
          result.errorCode = 0;
          ResponseHandler.invoke(RESPONSE_TYPE.LOGIN, result);
        }
      },
    });
    if (params.password != null) {
      params.password = '******';
    }
    logger.debug('ClinkAgent.login: 登录,' + JSON.stringify(params));
  },

  safeLogin(params: LoginParams) {
    params.cno = params.cno.toString();
    if (!params.identifier) {
      params.identifier = GLOBAL.identifier;
    }

    Util.ajax({
      type: 'GET',
      url: GLOBAL.webSocketUrl + '/safeLogin',
      dataType: 'jsonp',
      data: {
        identifier: params.identifier,
        cno: params.cno,
        password: encodeURIComponent(params.password || ''),
      },
      jsonp: 'callback',
      success: function (result: any) {
        if (result.code === 0) {
          const onlineParams: OnlineParams = {
            identifier: params.identifier || GLOBAL.identifier,
            enterpriseId: result.data.enterpriseId,
            cno: params.cno,
            qids: result.data.qids,
            emailQids: result.data.emailQids,
            webSocketUrl: result.data.webSocketUrl,
            token: result.data.token,
            allowBackward: result.data.allowBackward,
            answerCallsByCloseBrowser: result.data.answerCallsByCloseBrowser,
            unbindPhoneByCloseBrowser: result.data.unbindPhoneByCloseBrowser,
          };

          if (params.forceLoginCheck === undefined) {
            params.forceLoginCheck = false;
          }
          if (typeof params.forceLoginCheck === 'string') {
            params.forceLoginCheck = Boolean(params.forceLoginCheck);
          }

          if (document.location.protocol === 'https:') {
            onlineParams.webSocketUrl = (onlineParams.webSocketUrl || '').replace('http:', 'https:');
          }

          if (params.bindType !== undefined && typeof params.bindType === 'string') {
            params.bindType = Number(params.bindType);
          }
          if (params.type !== undefined && typeof params.type === 'string') {
            params.type = Number(params.type);
          }

          onlineParams.timeStamp = new Date().getTime().toString();
          ClinkClient.online(onlineParams);
        } else {
          logger.error(JSON.stringify(result));
          result.code = -1;
          result.reqType = RESPONSE_TYPE.LOGIN;
          result.type = 'response';
          result.errorCode = 0;
          ResponseHandler.invoke(RESPONSE_TYPE.LOGIN, result);
        }
      },
    });
    if (params.password != null) {
      params.password = '******';
    }
    logger.debug('ClinkAgent.safeLogin: 登录,' + JSON.stringify(params));
  },

  online(params: OnlineParams) {
    if (!params.loginType) {
      params.loginType = 1;
    }

    initAgent(params);

    if (params.allowBackward !== undefined) {
      GLOBAL.allowBackward = params.allowBackward;
    }
    if (params.answerCallsByCloseBrowser !== undefined) {
      GLOBAL.answerCallsByCloseBrowser = params.answerCallsByCloseBrowser;
    }
    if (params.unbindPhoneByCloseBrowser !== undefined) {
      GLOBAL.unbindPhoneByCloseBrowser = params.unbindPhoneByCloseBrowser;
    }

    if (GLOBAL.connected) {
      WebSocketClient.login();
    } else {
      WebSocketClient.connect();
      if (Agent.subQueue != null) {
        WebSocketClient.subscribeQueue();
      }
      if (Agent.subChatQueue != null) {
        WebSocketClient.subscribeChatQueue();
      }
    }
  },

  logout(params?: LogoutParams) {
    params = params || {};
    logger.debug('ClinkAgent.logout: 登出,' + JSON.stringify(params));
    if (GLOBAL.connected && !GLOBAL.logout) {
      if (Agent.bindType === 3) {
        SipPhone.sipUnRegister();
      }
    }

    if (params.removeBinding !== 0 && params.removeBinding !== 1) {
      params.removeBinding = 0;
    }
    params.logoutMode = params.logoutMode === 1 ? 1 : 0;

    if (params.logoutMode === 0) {
      params.removeBinding = 0;
      if (params.answerCallsByCloseBrowser === 1) {
        params.logoutMode = 1;
        if (params.unbindPhoneByCloseBrowser === 1) {
          params.removeBinding = 1;
        }
      }
    }
    if (!params.logoutType) {
      params.logoutType = 1;
    }
    if (!params.automatic) {
      params.automatic = 0;
    }

    WebSocketClient.sendToken({
      type: 'logout',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      removeBinding: params.removeBinding,
      logoutType: params.logoutType,
      chatClose: params.chatClose,
      keepCCOnline: params.logoutMode === 0,
      automatic: params.automatic,
    });
  },

  queueStatus(params: { qnos?: string; fields?: string }) {
    logger.debug('ClinkAgent.queueStatus: 队列状态,' + JSON.stringify(params));
    if (params.qnos === undefined) {
      params.qnos = '';
    }
    if (params.fields === undefined) {
      params.fields = '';
    }
    WebSocketClient.sendToken({
      type: 'queueStatus',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      qnos: params.qnos,
      fields: params.fields,
    });
  },

  pause(params: PauseParams) {
    logger.debug('ClinkAgent.pause: 置忙,' + JSON.stringify(params));
    if (isNaN(params.pauseType as number)) {
      params.pauseType = 1;
    }
    if (!params.pauseDescription) {
      params.pauseDescription = '置忙';
    }
    WebSocketClient.sendToken({
      type: 'pause',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      pauseType: params.pauseType,
      pauseDescription: params.pauseDescription,
    });
  },

  unpause(_params?: any) {
    logger.debug('ClinkAgent.unpause: 置闲');
    WebSocketClient.sendToken({
      type: 'unpause',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  status(params: StatusParams) {
    logger.debug('ClinkAgent.status: 座席状态,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'status',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      monitoredCno: params.monitoredCno,
    });
  },

  previewOutcall(params: PreviewOutcallParams) {
    logger.debug('ClinkAgent.previewOutcall: 预览外呼,' + JSON.stringify(params));
    if (!params.tel || params.tel.length === 0) {
      logger.debug('ClinkAgent.previewOutcall: 预览外呼, Error invalid tel');
      return;
    }
    params.tel = params.tel.replace(/\s+/g, '').replace(/-/g, '');
    if (isNaN(params.timeout) || (params.timeout as number) > 60 || (params.timeout as number) < 5) {
      params.timeout = 30;
    }
    if (isNaN(params.dialTelTimeout) || (params.dialTelTimeout as number) > 60 || (params.dialTelTimeout as number) < 5) {
      params.dialTelTimeout = 60;
    }
    WebSocketClient.sendToken({
      type: 'previewOutcall',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      previewOutcallTel: params.tel,
      timeout: params.timeout,
      dialTelTimeout: params.dialTelTimeout,
      obClidLeftNumber: params.obClid || '',
      obClidGroup: params.obClidGroup || '',
      userField: params.userField || {},
      requestUniqueId: params.requestUniqueId || '',
      backupTels: params.backupTels || '',
      callType: params.callType || 4,
      taskId: params.taskId || null,
      taskInventoryId: params.taskInventoryId || null,
    });
  },

  internalCall(params: { calleeNumber: string; timeout?: number; dialTelTimeout?: number; userField?: any; internalType?: any }) {
    logger.debug('ClinkAgent.internalCall | 内部呼叫,' + JSON.stringify(params));
    if (!params.calleeNumber) {
      logger.debug('ClinkAgent.internalCall | 内部呼叫, 号码不能为空');
      return;
    }
    if (isNaN(params.timeout) || params.timeout > 60 || params.timeout < 5) {
      params.timeout = 30;
    }
    if (isNaN(params.dialTelTimeout) || params.dialTelTimeout > 60 || params.dialTelTimeout < 5) {
      params.dialTelTimeout = 45;
    }
    WebSocketClient.sendToken({
      type: 'internalCall',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      timeout: params.timeout,
      dialTelTimeout: params.dialTelTimeout,
      userField: params.userField || {},
      calleeNumber: params.calleeNumber,
      internalType: params.internalType,
    });
  },

  directCallStart(params: { tel: number }) {
    logger.debug('ClinkAgent.directCallStart: 主叫外呼,' + JSON.stringify(params));
    if (isNaN(params.tel)) {
      logger.debug('ClinkAgent.directCallStart: 主叫外呼, Error invalid tel');
      return;
    }
    WebSocketClient.sendToken({
      type: 'directCallStart',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      customerNumber: params.tel,
    });
  },

  changeBindTel(params: ChangeBindTelParams) {
    logger.debug('ClinkAgent.changeBindTel: 修改绑定电话,' + JSON.stringify(params));
    if (isNaN(params.bindTel)) {
      logger.debug('ClinkAgent.changeBindTel: 修改绑定电话, Error invalid bindTel');
      return;
    }
    if (isNaN(params.bindType)) {
      logger.debug('ClinkAgent.changeBindTel: 修改绑定电话, Error invalid bindType');
      return;
    }
    WebSocketClient.sendToken({
      type: 'changeBindTel',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      bindTel: params.bindTel,
      bindType: params.bindType,
    });
  },

  setCdrTag(params: { uniqueId: string; callType: number; key: string; value: string }) {
    logger.debug('ClinkAgent.setCdrTag: 设置tag,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'setCdrTag',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      uniqueId: params.uniqueId,
      callType: params.callType,
      key: params.key,
      value: params.value,
    });
  },

  getCdrTag(params: { uniqueId: string; key?: string }) {
    logger.debug('ClinkAgent.getCdrTag: 获取tag,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'getCdrTag',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      uniqueId: params.uniqueId,
      key: params.key || '',
    });
  },

  prolongWrapup(params: ProlongWrapupParams) {
    logger.debug('ClinkAgent.prolongWrapup: 延长整理时间,' + JSON.stringify(params));
    if (isNaN(params.wrapupTime) || params.wrapupTime < 30 || params.wrapupTime > 600) {
      logger.debug('ClinkAgent.prolongWrapup: 延长整理时间, Error invalid wrapupTime');
      return;
    }
    WebSocketClient.sendToken({
      type: 'prolongWrapup',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      wrapupTime: params.wrapupTime,
    });
  },

  unlink(params?: { side?: string }) {
    logger.debug('ClinkAgent.unlink: 挂断,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.unlink: 挂断失败, session已经销毁');
      return;
    }
    const side = params && params.side !== undefined ? params.side : '';
    WebSocketClient.sendToken({
      type: 'unlink',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      side: side,
    });
  },

  previewOutcallCancel(_params?: any) {
    logger.debug('ClinkAgent.previewOutcallCancel: 外呼取消');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.previewOutcallCancel: 外呼取消失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'previewOutcallCancel',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  hold(params?: { holdType?: number }) {
    logger.debug('ClinkAgent.hold: 保持,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.hold: 保持失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'hold',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      holdType: params && params.holdType !== undefined ? params.holdType : 0,
    });
  },

  unhold(params?: { holdType?: number }) {
    logger.debug('ClinkAgent.unhold: 保持接回,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.unhold: 保持接回失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'unhold',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      holdType: params && params.holdType !== undefined ? params.holdType : 0,
    });
  },

  consult(params: ConsultParams) {
    logger.debug('ClinkAgent.consult: 咨询,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.consult: 咨询失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'consult',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      consultObject: params.consultObject,
      objectType: params.objectType,
    });
  },

  consultCancel(_params?: any) {
    logger.debug('ClinkAgent.consultCancel: 咨询取消');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.consultCancel: 咨询取消失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'consultCancel',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  consultTransfer(params?: { limitTimeSecond?: string; limitTimeAlertSecond?: string; limitTimeFile?: string }) {
    logger.debug('ClinkAgent.consultTransfer: 咨询转移');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.consultTransfer: 咨询转移失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'consultTransfer',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      limitTimeSecond: params?.limitTimeSecond || '',
      limitTimeAlertSecond: params?.limitTimeAlertSecond || '',
      limitTimeFile: params?.limitTimeFile || '',
    });
  },

  consultThreeway(_params?: any) {
    logger.debug('ClinkAgent.consultThreeway: 咨询三方');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.consultThreeway: 咨询三方失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'consultThreeway',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  unconsult(_params?: any) {
    logger.debug('ClinkAgent.unconsult: 咨询接回');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.unconsult: 咨询接回失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'unconsult',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  transfer(params: TransferParams) {
    logger.debug('ClinkAgent.transfer: 转移,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.transfer: 转移失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'transfer',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      transferObject: params.transferObject,
      objectType: params.objectType,
      transferVariables: params.transferVariables,
    });
  },

  interact(params: InteractParams) {
    logger.debug('ClinkAgent.interact: 交互,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.interact: 交互失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'interact',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      interactType: params.interactType,
      interactedCno: params.interactedCno,
      ivrId: params.ivrId,
      ivrNode: params.ivrNode,
      interactVariables: params.interactVariables,
    });
  },

  investigation(_params?: any) {
    logger.debug('ClinkAgent.investigation: 满意度调查');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.investigation: 满意度调查失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'investigation',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  refuse(_params?: any) {
    logger.debug('ClinkAgent.refuse: 拒接');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.refuse: 拒接失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'refuse',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  mute(params?: { direction?: string }) {
    logger.debug('ClinkAgent.mute: 静音,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.mute: 静音失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'mute',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      direction: params?.direction,
    });
  },

  unmute(params?: { direction?: string }) {
    logger.debug('ClinkAgent.unmute: 取消静音,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.unmute: 取消静音失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'unmute',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      direction: params?.direction,
    });
  },

  enterprise_pause() {
    WebSocketClient.sendToken({
      type: 'enterprise_pause',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  spy(params: SpyParams) {
    logger.debug('ClinkAgent.spy: 监听,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'spy',
      enterpriseId: Agent.enterpriseId,
      spiedCno: params.cno,
      spyObject: Agent.cno,
      objectType: 1,
    });
  },

  unspy(params: SpyParams) {
    logger.debug('ClinkAgent.unspy: 取消监听,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'unspy',
      enterpriseId: Agent.enterpriseId,
      spiedCno: Agent.cno,
    });
  },

  threeway(params: SpyParams) {
    logger.debug('ClinkAgent.threeway: 三方,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'threeway',
      enterpriseId: Agent.enterpriseId,
      threewayedCno: params.cno,
      threewayObject: Agent.cno,
      objectType: 1,
    });
  },

  unthreeway(params: SpyParams) {
    logger.debug('ClinkAgent.unthreeway: 取消三方,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'unthreeway',
      enterpriseId: Agent.enterpriseId,
      threewayedCno: params.cno,
    });
  },

  whisper(params: SpyParams) {
    logger.debug('ClinkAgent.whisper: 耳语,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'whisper',
      enterpriseId: Agent.enterpriseId,
      whisperedCno: params.cno,
      whisperObject: Agent.cno,
      objectType: 1,
    });
  },

  unwhisper(params: SpyParams) {
    logger.debug('ClinkAgent.unwhisper: 取消耳语,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'unwhisper',
      enterpriseId: Agent.enterpriseId,
      whisperedCno: params.cno,
    });
  },

  pickup(params: SpyParams) {
    logger.debug('ClinkAgent.pickup: 抢线,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'pickup',
      enterpriseId: Agent.enterpriseId,
      pickupedCno: params.cno,
      cno: Agent.cno,
    });
  },

  disconnect(params: SpyParams) {
    logger.debug('ClinkAgent.disconnect: 强拆,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'disconnect',
      enterpriseId: Agent.enterpriseId,
      disconnectedCno: params.cno,
      disconnectObject: Agent.cno,
      objectType: 1,
    });
  },

  barge(params: SpyParams) {
    logger.debug('ClinkAgent.barge: 强插,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'barge',
      enterpriseId: Agent.enterpriseId,
      cno: params.cno,
      bargeObject: Agent.cno,
      objectType: 1,
    });
  },

  pause_client(params: { cno: string; pauseDescription?: string }) {
    logger.debug('ClinkAgent.pause_client: 置忙,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'pause_client',
      enterpriseId: Agent.enterpriseId,
      monitorCno: Agent.cno,
      monitoredCno: params.cno,
      pauseDescription: params.pauseDescription || '管理置忙',
    });
  },

  unpause_client(params: SpyParams) {
    logger.debug('ClinkAgent.unpause_client: 置闲,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'unpause_client',
      enterpriseId: Agent.enterpriseId,
      monitorCno: Agent.cno,
      monitoredCno: params.cno,
    });
  },

  offline_client(params: SpyParams) {
    logger.debug('ClinkAgent.offline_client: 下线,' + JSON.stringify(params));
    WebSocketClient.sendToken({
      type: 'offline_client',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      offlineCno: params.cno,
    });
  },

  setUserData(params: { userData: any; direction?: string }) {
    logger.debug('ClinkAgent.setUserData: 设置随路数据,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.setUserData: 设置随路数据失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'setUserData',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      userData: params.userData,
      direction: params.direction,
    });
  },

  getUserData(params: { keys: string; encryptKeys?: string; encryption?: string; direction?: string }) {
    logger.debug('ClinkAgent.getUserData: 获取随路数据,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.getUserData: 获取随路数据失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'getUserData',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      keys: params.keys,
      encryptKeys: params.encryptKeys,
      encryption: params.encryption,
      direction: params.direction,
    });
  },

  dtmf(params: DtmfParams) {
    logger.debug('ClinkAgent.dtmf: 发送dtmf,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.dtmf: 发送dtmf失败, session已经销毁');
      return;
    }
    const digitsPattern = /^[0-9*#]*$/;
    if (!params.digits || !digitsPattern.test(params.digits)) {
      logger.debug('ClinkAgent.dtmf: 发送dtmf失败, 参数digits格式不正确');
      return;
    }
    if (params.direction !== 'in' && params.direction !== 'out') {
      logger.debug('ClinkAgent.dtmf: 发送dtmf失败, 参数direction格式不正确');
      return;
    }
    if (!params.duration || isNaN(params.duration)) {
      params.duration = 100;
    }
    if (params.duration < 100 || params.duration > 500) {
      logger.debug('ClinkAgent.dtmf: 发送dtmf失败, 参数duration取值不正确');
      return;
    }
    if (!params.gap || isNaN(params.gap)) {
      params.gap = 250;
    }
    if (params.gap < 250 || params.gap > 1000) {
      logger.debug('ClinkAgent.dtmf: 发送dtmf失败, 参数gap取值不正确');
      return;
    }
    WebSocketClient.sendToken({
      type: 'dtmf',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      digits: params.digits,
      direction: params.direction,
      duration: params.duration,
      gap: params.gap,
    });
  },

  controlPlayback(params: PlaybackParams) {
    logger.debug('ClinkAgent.controlPlayback: 录音回放,' + JSON.stringify(params));
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.controlPlayback: 录音回放失败, session已经销毁');
      return;
    }
    WebSocketClient.sendToken({
      type: 'controlPlayback',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      action: params.action,
      playUrl: params.playUrl,
      skipMs: params.skipMs,
    });
  },

  sendVerificationCode(params: { bindTel: string }) {
    if (!params || !params.bindTel) {
      logger.debug('ClinkAgent.sendVerificationCode: 发送验证码失败，绑定电话不能为空');
      return;
    }
    WebSocketClient.sendToken({
      type: 'sendVerificationCode',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      bindTel: params.bindTel,
    });
  },

  sipCall(params: SipCallParams) {
    logger.debug('ClinkAgent.sipCall: 软电话外呼,' + JSON.stringify(params));
    SipPhone.sipCall(params.tel);
  },

  sipLink() {
    logger.debug('ClinkAgent.sipLink: sip接听');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.sipLink: sip接听失败, session已经销毁');
      return;
    }
    SipPhone.sipAnswer();
  },

  sipUnlink() {
    logger.debug('ClinkAgent.sipUnlink: sip挂断');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.sipUnlink: sip挂断失败, session已经销毁');
      return;
    }
    SipPhone.sipHangup();
  },

  sipDTMF(params: { digits: string }) {
    logger.debug('ClinkAgent.sipDTMF: sipDTMF');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.sipDTMF: sipDTMF失败, session已经销毁');
      return;
    }
    SipPhone.sendDTMF(params.digits);
  },

  sipRefuse() {
    logger.debug('ClinkAgent.sipRefuse: sip拒接');
    if (!CallSession.isSessionAlive()) {
      logger.debug('ClinkAgent.sipRefuse: sip拒接失败, session已经销毁');
      return;
    }
    SipPhone.sipReject();
  },

  subscribeQueue: WebSocketClient.subscribeQueue,
  unsubscribeQueue: WebSocketClient.unsubscribeQueue,
  subscribeWholeQueue: WebSocketClient.subscribeWholeQueue,
  unsubscribeWholeQueue: WebSocketClient.unsubscribeWholeQueue,
  subscribeMonitor: WebSocketClient.subscribeMonitor,
  unsubscribeMonitor: WebSocketClient.unsubscribeMonitor,
  subscribeEmail: WebSocketClient.subscribeEmail,
  subscribeChatQueue: WebSocketClient.subscribeChatQueue,
  unsubscribeChatQueue: WebSocketClient.unsubscribeChatQueue,
  subscribeEnterprise: WebSocketClient.subscribeEnterprise,
  unsubscribeEnterprise: WebSocketClient.unsubscribeEnterprise,

  registerListener(type: string, listener: EventListener) {
    if (Util.isFunction(listener)) {
      EventSystem.registerListener(type, listener);
    } else {
      logger.error('ClinkAgent.registerListener: 2rd parameter callback must be function!');
    }
  },

  registerCallback(type: string, callback: ResponseCallback) {
    if (Util.isFunction(callback)) {
      ResponseHandler.registerCallback(type, callback);
    } else {
      logger.error('ClinkAgent.registerCallback: 2rd parameter callback must be function!');
    }
  },

  chatSendMessage(params: ChatMessageParams) {
    WebSocketClient.chatSendToken({
      type: 'message',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      mainUniqueId: params.mainUniqueId,
      content: params.content,
      messageType: params.messageType,
      messageId: params.messageId,
    });
  },

  chatSendKbFile(params: { mainUniqueId: string; fileKey: string; fileName: string; messageId?: string }) {
    WebSocketClient.chatSendToken({
      type: 'kbfile',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      mainUniqueId: params.mainUniqueId,
      fileKey: params.fileKey,
      fileName: params.fileName,
      messageId: params.messageId,
    });
  },

  chatTransfer(params: ChatTransferParams) {
    WebSocketClient.chatSendToken({
      type: 'transfer',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
      targetNo: params.targetNo,
      targetType: params.targetType,
      transferBy: Agent.cno,
      transferByType: params.transferByType || 1,
    });
  },

  chatThreeway(params: { mainUniqueId: string; targetCno: string }) {
    WebSocketClient.chatSendToken({
      type: 'threeway',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      mainUniqueId: params.mainUniqueId,
      targetCno: params.targetCno,
    });
  },

  chatClose(params: { mainUniqueIds: string[]; ignoreBizRequired?: boolean }) {
    WebSocketClient.chatSendToken({
      type: 'close',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      mainUniqueIds: params.mainUniqueIds,
      ignoreBizRequired: params.ignoreBizRequired,
    });
  },

  chatInvestigation(params: { mainUniqueId: string }) {
    WebSocketClient.chatSendToken({
      type: 'investigation',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      mainUniqueId: params.mainUniqueId,
    });
  },

  chatLockSession(params: { mainUniqueId: string }) {
    WebSocketClient.chatSendToken({
      type: 'lockSession',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      mainUniqueId: params.mainUniqueId,
    });
  },

  chatUnlockSession(params: { mainUniqueId: string }) {
    WebSocketClient.chatSendToken({
      type: 'unlockSession',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      mainUniqueId: params.mainUniqueId,
    });
  },

  chatPause(params: { pauseDescription?: string }) {
    WebSocketClient.chatSendToken({
      type: 'pause',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      chatPauseDescription: params.pauseDescription,
    });
  },

  chatUnpause(_params?: any) {
    WebSocketClient.chatSendToken({
      type: 'unpause',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
    });
  },

  chatSetPause(params: { monitoredCno: string }) {
    WebSocketClient.chatSendToken({
      type: 'setPause',
      enterpriseId: Agent.enterpriseId,
      monitorCno: Agent.cno,
      monitoredCno: params.monitoredCno,
    });
  },

  chatSetUnpause(params: { monitoredCno: string }) {
    WebSocketClient.chatSendToken({
      type: 'setUnpause',
      enterpriseId: Agent.enterpriseId,
      monitorCno: Agent.cno,
      monitoredCno: params.monitoredCno,
    });
  },

  chatHistory(params: { visitorId: string; startTime: string }) {
    WebSocketClient.chatSendToken({
      type: 'history',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      visitorId: params.visitorId,
      startTime: params.startTime,
    });
  },

  visitBridge(params: { startTime: string; mainUniqueId: string }) {
    WebSocketClient.chatSendToken({
      type: 'visitBridge',
      enterpriseId: Agent.enterpriseId,
      cno: Agent.cno,
      startTime: params.startTime,
      mainUniqueId: params.mainUniqueId,
    });
  },

  visitRestrict(params: { visitorId: string; mainUniqueId: string; reason?: string }) {
    WebSocketClient.chatSendToken({
      type: 'restrict',
      enterpriseId: Agent.enterpriseId,
      visitorId: params.visitorId,
      mainUniqueId: params.mainUniqueId,
      cno: Agent.cno,
      restrictReason: params.reason,
    });
  },

  inviteGroup(params: GroupParams) {
    WebSocketClient.chatSendToken({
      type: 'inviteGroup',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
      inviterCno: Agent.cno,
      inviteeCno: params.inviteeCno,
    });
  },

  disinviteGroup(params: GroupParams) {
    WebSocketClient.chatSendToken({
      type: 'disinviteGroup',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
      inviterCno: Agent.cno,
      inviteeCno: params.inviteeCno,
    });
  },

  joinGroup(params: GroupParams) {
    WebSocketClient.chatSendToken({
      type: 'joinGroup',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
      inviterCno: params.inviterCno,
      inviteeCno: Agent.cno,
    });
  },

  refuseGroup(params: GroupParams) {
    WebSocketClient.chatSendToken({
      type: 'refuseGroup',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
      inviterCno: params.inviterCno,
      inviteeCno: Agent.cno,
    });
  },

  removeGroup(params: GroupParams) {
    WebSocketClient.chatSendToken({
      type: 'removeGroup',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
      inviterCno: Agent.cno,
      inviteeCno: params.inviteeCno,
    });
  },

  quitGroup(params: GroupParams) {
    WebSocketClient.chatSendToken({
      type: 'quitGroup',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
      inviterCno: params.inviterCno,
      inviteeCno: Agent.cno,
    });
  },

  inputHint(params: { mainUniqueId: string }) {
    WebSocketClient.chatSendToken({
      type: 'inputHint',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
    });
  },

  readReceipt(params: { mainUniqueId: string; readTime: string }) {
    WebSocketClient.chatSendToken({
      type: 'readReceipt',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
      readTime: params.readTime,
    });
  },

  remoteControl(params: RemoteControlParams) {
    WebSocketClient.chatSendToken({
      type: 'remoteControl',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
    });
  },

  remoteControlCancel(params: RemoteControlParams) {
    WebSocketClient.chatSendToken({
      type: 'remoteControlCancel',
      enterpriseId: Agent.enterpriseId,
      mainUniqueId: params.mainUniqueId,
    });
  },

  emailClaim(params: EmailParams) {
    WebSocketClient.emailSendToken({
      type: 'claim',
      enterpriseId: Agent.enterpriseId,
      sessionId: params.sessionId,
      cno: Agent.cno,
    });
  },

  emailFinish(params: EmailParams) {
    WebSocketClient.emailSendToken({
      type: 'finish',
      enterpriseId: Agent.enterpriseId,
      sessionId: params.sessionId,
      cno: Agent.cno,
    });
  },

  emailTransfer(params: EmailParams) {
    WebSocketClient.emailSendToken({
      type: 'transfer',
      enterpriseId: Agent.enterpriseId,
      sessionId: params.sessionId,
      targetCno: params.targetCno,
      targetQno: params.targetQno,
      enterpriseEmail: params.enterpriseEmail,
      cno: Agent.cno,
    });
  },

  emailRead(params: EmailParams) {
    WebSocketClient.emailSendToken({
      type: 'read',
      enterpriseId: Agent.enterpriseId,
      sessionId: params.sessionId,
      cno: Agent.cno,
    });
  },

  emailRubbish(params: EmailParams) {
    WebSocketClient.emailSendToken({
      type: 'rubbish',
      enterpriseId: Agent.enterpriseId,
      sessionId: params.sessionId,
      cno: Agent.cno,
    });
  },

  emailRecovery(params: EmailParams) {
    WebSocketClient.emailSendToken({
      type: 'recovery',
      enterpriseId: Agent.enterpriseId,
      sessionId: params.sessionId,
      cno: Agent.cno,
    });
  },

  emailInvestgation(params: EmailParams) {
    WebSocketClient.emailSendToken({
      type: 'investgation',
      enterpriseId: Agent.enterpriseId,
      sessionId: params.sessionId,
      cno: Agent.cno,
    });
  },

  unloadLogout() {
    const params: LogoutParams = {
      logoutMode: 0,
      chatClose: 0,
      logoutType: Agent.loginType,
      answerCallsByCloseBrowser: Agent.answerCallsByCloseBrowser,
      unbindPhoneByCloseBrowser: Agent.unbindPhoneByCloseBrowser,
      automatic: 1,
    };
    ClinkClient.logout(params);
  },

  EventType: EVENT_TYPE,
  ResponseType: RESPONSE_TYPE,
};

/* ======================== 浏览器事件 ======================== */

EventUtil.addHandler(window, 'unload', function () {
  ClinkClient.logout({
    logoutMode: 0,
    chatClose: 0,
    logoutType: Agent.loginType,
    answerCallsByCloseBrowser: Agent.answerCallsByCloseBrowser,
    unbindPhoneByCloseBrowser: Agent.unbindPhoneByCloseBrowser,
    automatic: 1,
  });
});

(window as any).onbeforeunload = function () {
  ClinkClient.logout({
    logoutMode: 0,
    chatClose: 0,
    logoutType: Agent.loginType,
    answerCallsByCloseBrowser: Agent.answerCallsByCloseBrowser,
    unbindPhoneByCloseBrowser: Agent.unbindPhoneByCloseBrowser,
    automatic: 1,
  });
};

/* ======================== 默认回调 ======================== */

const defaultCallback: ResponseCallback = function (token) {
  logger.debug(JSON.stringify(token));
};

ResponseHandler.registerCallback(RESPONSE_TYPE.LOGIN, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.LOGOUT, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.QUEUE_STATUS, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.PAUSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNPAUSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.STATUS, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.PREVIEW_OUTCALL, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.DIRECT_CALL_START, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHANGE_BIND_TEL, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.SET_CDR_TAG, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.PROLONG_WRAPUP, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNLINK, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.PREVIEW_OUTCALL_CANCEL, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.HOLD, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNHOLD, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CONSULT, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CONSULT_CANCEL, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CONSULT_TRANSFER, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNCONSULT, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.TRANSFER, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.INTERACT, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.INVESTIGATION, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.REFUSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.MUTE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNMUTE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.ENTERPRISE_PAUSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.SET_USER_DATA, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.GET_USER_DATA, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.DTMF, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CONTROL_PLAYBACK, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.SEND_VERIFICATION_CODE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.SIP_CALL, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.SIP_LINK, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.SIP_UNLINK, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.SIP_DTMF, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.PING, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.SPY, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNSPY, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.THREEWAY, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNTHREEWAY, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.WHISPER, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNWHISPER, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.PICKUP, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.DISCONNECT, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.BARGE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.PAUSE_CLIENT, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.UNPAUSE_CLIENT, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_MESSAGE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_TRANSFER, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_CLOSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_PAUSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_UNPAUSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_SET_PAUSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_SET_UNPAUSE, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_QUEUE_STATUS, defaultCallback);
ResponseHandler.registerCallback(RESPONSE_TYPE.CHAT_REMOTE_CONTROL, defaultCallback);

/* ======================== 初始化 ======================== */

export function createClinkAgent(identifier: string, websocketUrl: string) {
  if (!identifier) {
    logger.error('can not run toolbar without identifier!');
  }
  if (!websocketUrl) {
    logger.error('can not run toolbar without websocketRoot!');
  }

  if (document.location.protocol === 'https:') {
    websocketUrl = websocketUrl.replace('http:', 'https:');
  }

  GLOBAL.identifier = identifier;
  GLOBAL.webSocketUrl = websocketUrl;

  // IE浏览器加载flash对WebSocket的支持
  if (Util.isIE()) {
    logger.debug('Flash: IE load flash-bridge');
    window.WEB_SOCKET_SWF_LOCATION =
      GLOBAL.webSocketUrl +
      '/flashbridge/WebSocketMainInsecure.swf?t=' +
      new Date().getTime();
    window.WEB_SOCKET_DEBUG = GLOBAL.debug;
    scriptUrls.unshift(...flashScriptUrls);
  }

  Util.loadScript(scriptUrls, 0);
  Util.loadScript(cryptoJSUrls, 0);

  return ClinkClient;
}

export default ClinkClient;
