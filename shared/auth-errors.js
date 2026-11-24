const MESSAGES = {
    "auth/invalid-email": "Digite um e-mail válido.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/weak-password": "Escolha uma senha mais forte.",
    "auth/too-many-requests": "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
    "auth/network-request-failed": "Sem conexão com a internet. Verifique sua rede e tente de novo.",
    "auth/popup-blocked": "O navegador bloqueou a janela do Google. Permita pop-ups para este site."
};

const SILENT_CODES = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

export function getAuthErrorMessage(error, fallback = "Algo deu errado. Tente novamente.") {
    return MESSAGES[error?.code] ?? fallback;
}

export function isSilentAuthError(error) {
    return SILENT_CODES.has(error?.code);
}