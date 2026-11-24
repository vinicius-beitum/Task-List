import { db, doc, getDoc, setDoc, serverTimestamp } from "./firebase.js";

export async function ensureUserDocument(user) {
    const userRef = doc(db, "usuarios", user.uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) return;

    await setDoc(userRef, {
        nome: user.displayName ?? "",
        email: user.email ?? "",
        criadoEm: serverTimestamp()
    });
}