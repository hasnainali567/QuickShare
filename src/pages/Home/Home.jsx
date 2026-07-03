import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  TextArea,
  Button,
  Dropzone,
  FileList,
  PopUp,
  PasswordPopup,
  SharedUrl,
} from "../../components";
import CryptoJS from "crypto-js";
import {
  db,
  doc,
  onSnapshot,
  collection,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  arrayUnion,
  query,
  where,
} from "../../config/firebaseConfig.js";
import { message } from "antd";
import { FaPlus } from "react-icons/fa6";
import { LuFile, LuFiles, LuLetterText, LuText } from "react-icons/lu";

import "./style.scss";
import { useSaving } from "../../context/SavingContext.jsx";
import { addDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx";

const Home = () => {
  const [type, setType] = useState("text");
  const [value, setValue] = useState("");
  const [file, setfile] = useState([]);
  const [urls, setUrls] = useState([]);
  const [btnText, setBtnText] = useState("Save");
  const [savePopup, setSavePopup] = useState(false);
  const [shareableUrl, setShareableUrl] = useState("");
  const [hasSavedBefore, setHasSavedBefore] = useState(false);
  const [popoverContent, setPopoverContent] = useState("Copy the Url");
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [initialEncryptedText, setInitialEncryptedText] = useState(null);
  const [startListening, setStartListening] = useState(false);
  const [myDocs, setMyDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const { saving, setSaving } = useSaving();
  const { user } = useAuth();
  const [readonly, setReadonly] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const fileCountRef = useRef(0);
  const passRef = useRef(null);

  useEffect(() => {
    fileCountRef.current = file.length;
  }, [file]);
  const docIdRef = useRef(null);
  const textAreaRef = useRef(null);
  const popupSaveRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const isProtectedFromUrl = searchParams.get("protected");
  const isProtected = Boolean(isProtectedFromUrl);
  const isLockedProtectedDoc = Boolean(id && isProtected && !startListening);
  const isReadOnlyDoc = Boolean(readonly && docIdRef.current);

  useEffect(() => {
    console.log("id changed, clearing state, new id:", id);
    setValue("");
    setfile([]);
    setUrls([]);
    setBtnText("Save");
    setHasSavedBefore(false);
    setStartListening(false);
    setPasswordPopupOpen(false);
    setInitialEncryptedText(null);
    setReadonly(false);
    passRef.current = null;
    docIdRef.current = id; // Set immediately so onSnapshot can use it

    if (textAreaRef.current) {
      textAreaRef.current.value = "";
    }
  }, [id]);

  useEffect(() => {
    const url = localStorage.getItem("Url");
    if (url) {
      const query = new URL(url, window.location.origin).search;
      localStorage.removeItem("Url");
      navigate(`/${query}`);
    }
  }, []);

  useEffect(() => {
    if (shareableUrl && !id && !isProtected) {
      localStorage.setItem("Url", shareableUrl);
    }
  }, [shareableUrl, id, isProtected]);

  useEffect(() => {
    if (!user) {
      setMyDocs([]);
      return;
    }

    setDocsLoading(true);
    const docsQuery = query(collection(db, "text"), where("ownerUid", "==", user.uid));
    const unsubscribe = onSnapshot(docsQuery, (snapshot) => {
      const docs = snapshot.docs
        .map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setMyDocs(docs);
      setDocsLoading(false);
    }, () => {
      setDocsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!isProtected || !id) return;

    async function fetchProtectedData() {
      try {
        setPasswordPopupOpen(true); // show popup
        const docSnap = await getDoc(doc(db, "text", id));
        if (docSnap.exists()) {
          setInitialEncryptedText(docSnap.data().text);
          setReadonly(Boolean(docSnap.data()?.readonly));
          setShareableUrl(`${window.location.origin}/?id=${id}&protected=true`);
        }
      } catch (e) {
        console.error("Failed to fetch encrypted doc:", e);
      }
    }

    fetchProtectedData();
  }, [isProtected, id]);

useEffect(() => {
    if (isProtected || !id) return;
    async function fetchDocState() {
      console.log("fetchDocState called for id:", id);
      const docSnap = await getDoc(doc(db, "text", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("fetchDocState found doc:", data);
        setReadonly(Boolean(data?.readonly));
      } else {
        console.log("fetchDocState: doc not found");
      }
      setHasSavedBefore(true);
      docIdRef.current = id;
      setShareableUrl(`${window.location.origin}/?id=${docIdRef.current}`);
    }

    fetchDocState();
  }, [id, isProtected]);

  async function checkIfDocExists(docId) {
    if (!docId) return false;
    const docSnap = await getDoc(doc(db, "text", docId));
    return docSnap.exists();
  }

  const saveTextBtn = async () => {
    if (isReadOnlyDoc) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "This document is read-only.",
      });
      return;
    }

    if (!hasSavedBefore) {
      setSavePopup(true);
      return;
    }

    if (!navigator.onLine) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "No internet connection!",
      });
      setBtnText("Save");
      return;
    }

    if (btnText === "Save") {
      try {
        messageApi.open({
          type: "loading",
          content: "Saving...",
          duration: 0,
        });
        setBtnText("Saving...");
        const urls = extractUrls(value);
        setUrls([...new Set(urls)]);
        let docId = docIdRef.current;

        if (passRef.current !== null) {
          let encryptedText = secureEncrypt(value, passRef.current);
          console.log(encryptedText);
          console.log(file);
          console.log(readonly);

          if (type === 'text') {
            await updateDoc(doc(db, "text", docId), {
              text: encryptedText,
              readonly: readonly,
            });
          } else if (type === 'file') {
            await updateDoc(doc(db, "text", docId), {
              text: encryptedText,
              file: file,
              readonly: readonly,
            });
          }
        } else {
          await updateDoc(doc(db, "text", docId), {
            text: value,
            file: file,
            readonly: readonly,
          });
        }
        messageApi.destroy();
        messageApi.open({
          type: "success",
          content: "Saved",
        });
        setBtnText("Copy");
      } catch (error) {
        console.log(error);
        setBtnText("Save");
        messageApi.destroy();
        messageApi.open({
          type: "error",
          content: "Something went wrong!",
        });
      }
    } else if (btnText === "Copy") {
      textAreaRef.current.select();
      window.navigator.clipboard.writeText(textAreaRef.current.value);
      messageApi.open({
        type: "success",
        content: "Copied",
      });
    }
  };

  const base64ToBlob = useCallback((base64, contentType = '') => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  }, []);


  const downloadFiles = () => {
    if (!file.length) return;
    file.forEach((file) => {
      const blob = base64ToBlob(file.file || '', file.type || '');
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);

    });

  }

  

  useEffect(() => {
    if (!file) return;
    setBtnText("Save");
  }, [file]);

  useEffect(() => {
    if (!navigator.onLine) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Failed to Load No Internet! ",
      });

      return;
    }
    if (!docIdRef.current) return;

    const docRef = doc(db, "text", docIdRef.current);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        console.log("onSnapshot fired for doc:", docIdRef.current);
        console.log("doc data:", docSnap.data());

        const data = docSnap.data();
        let text = data.text;
        let fileData = data.file;
        const isReadonly = Boolean(data?.readonly);
        const docIsProtected = Boolean(data?.isProtected);

        console.log("Setting value:", text ? text.substring(0, 50) : "empty", "protected:", docIsProtected);

        setfile(fileData);
        setReadonly(isReadonly);
        setUrls([...new Set(extractUrls(text))]);

        if (passRef.current && docIsProtected) {
          try {
            const decrypted = secureDecrypt(text, passRef.current);
            setValue(decrypted);
          } catch (e) {
            setValue("[Encrypted - enter password]");
          }
        } else {
          setValue(text);
        }

        if (value) {
          setBtnText("Copy");
        }
      } else {
        console.log("Document does not exist:", docIdRef.current);
      }
    });
    return () => unsubscribe();
  }, [id, messageApi, passRef.current, startListening]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file); // 👈 This converts it to base64

      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const onDrop = async (acceptedFiles) => {
    if (isReadOnlyDoc) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "This document is read-only.",
      });
      return;
    }

    if (acceptedFiles && acceptedFiles.length + fileCountRef.current > 2) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "You can only upload 2 files!",
      });
      return;
    }
    if (acceptedFiles && acceptedFiles.some(file => file.size > 2 * 1024 * 1024)) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Each file must be less than 2 MB!",
      });
      return;
    }

    const base64Files = await Promise.all(
      acceptedFiles.map(async (file) => {
        const base64 = await convertToBase64(file);
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          file: base64,
        };
      })
    );

    let updatedFiles = [...file.slice(0, fileCountRef.current), ...base64Files];
    if (updatedFiles.length > 2) {
      updatedFiles = updatedFiles.slice(0, 2);
    }
    setfile(updatedFiles);

    try {
      messageApi.open({
        type: "loading",
        content: "Uploading...",
        duration: 0,
      });
      setSaving(true);
      if (!navigator.onLine) {
        messageApi.destroy();
        messageApi.open({
          type: "error",
          content: "Failed to upload: No internet connection!",
        });
        setSaving(false);
        return;
      }
      let isDocExist = await checkIfDocExists(docIdRef.current);
      if (isDocExist && docIdRef.current) {
        await updateDoc(doc(db, "text", docIdRef.current), {
          file: arrayUnion(...base64Files),
        });
      }
      messageApi.destroy();
      messageApi.open({
        type: "success",
        content: "Uploaded Successfully",
      });
      setSaving(false);

    } catch (error) {
      console.error("Error during file upload:", error);
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Error uploading files. Please try again.",
      });
      setSaving(false);
      return;
    }

  };

  const clearText = async () => {
    if (isReadOnlyDoc) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "This document is read-only.",
      });
      return;
    }

    let docId = docIdRef.current;

    if (!docId) {
      setValue("");
      setUrls([]);
      setBtnText("Save");
      if (type === "file") {
        setfile([]);
      }
      return;
    }
    if (!navigator.onLine) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Failed to clear: No internet connection!",
      });
      return;
    }

    try {
      setBtnText("Saving...");
      messageApi.open({
        type: "loading",
        content: "Saving...",
        duration: 0,
      });

      let isDocExist = await checkIfDocExists(docIdRef.current);

      if (isDocExist) {
        if (type === 'text') {
          await updateDoc(doc(db, "text", docId), {
            text: "",
          });
        } else {
          await updateDoc(doc(db, "text", docId), {
            file: [],
          });
        }

        setValue("");
        setBtnText("Save");
        setUrls([]);
        messageApi.destroy();
        messageApi.open({
          type: "success",
          content: "Cleared Successfully",
        });
      }
    } catch (error) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Error: Text not cleared.",
      });
    }
  };

  const extractUrls = (text) => {
    const urlRegex = /(https?:\/\/|www\.)[^\s<>"{}|\\^`\[\]]+/g;
    return text.match(urlRegex) || [];
  };

  // async function hashPassword(password) {
  //   const encoder = new TextEncoder();
  //   const data = encoder.encode(password);
  //   const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  //   const hashArray = Array.from(new Uint8Array(hashBuffer));
  //   const hashHex = hashArray
  //     .map((b) => b.toString(16).padStart(2, "0"))
  //     .join("");
  //   return hashHex;
  // }

  const onPopupSave = async (password, readonly) => {
    setSaving(true);
    try {
      if (!navigator.onLine) {
        messageApi.destroy();
        messageApi.open({
          type: "error",
          content: "You're offline! Please connect to the internet to save.",
        });

        setSaving(false);
        return;
      }

      messageApi.destroy();
      messageApi.open({
        type: "loading",
        content: "Saving...",
        duration: 0,
      });

      let encryptedText;
      let docRef;

      if (password !== "") {
        encryptedText = secureEncrypt(value, password);
        docRef = await addDoc(collection(db, "text"), {
          text: encryptedText,
          file: file,
          readonly: readonly,
          isProtected: true,
          ownerUid: user?.uid,
          ownerEmail: user?.email || null,
          ownerName: user?.displayName || user?.email || "QuickShare user",
          createdAt: Date.now(),
        });

        passRef.current = password;
        setShareableUrl(
          `${window.location.origin}/?id=${docRef.id}&protected=true&read-only=${readonly}`
        );
      } else {
        docRef = await addDoc(collection(db, "text"), {
          text: value,
          file: file,
          readonly: readonly,
          isProtected: false,
          ownerUid: user?.uid,
          ownerEmail: user?.email || null,
          ownerName: user?.displayName || user?.email || "QuickShare user",
          createdAt: Date.now(),
        });

        setShareableUrl(`${window.location.origin}/?id=${docRef.id}`);
      }

      docIdRef.current = docRef.id;

      messageApi.destroy();
      messageApi.open({
        type: "success",
        content: "Saved successfully",
      });

      setBtnText("Copy");
      setHasSavedBefore(true);
      setSavePopup(false);
      setSaving(false);
    } catch (error) {
      setSaving(false);
      console.error("Failed to save:", error);

      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Failed to save! Please try again.",
      });
    }
  };

  function secureEncrypt(text, password) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32, // 256-bit key
      iterations: 100000,
    });

    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    return [
      encrypted.toString(), // Base64 ciphertext
      salt.toString(), // Hex salt
      iv.toString(), // Hex IV
    ].join("|");
  }

  function secureDecrypt(encryptedData, password) {
    try {
      const [ciphertext, saltHex, ivHex] = encryptedData.split("|");

      const salt = CryptoJS.enc.Hex.parse(saltHex);
      const iv = CryptoJS.enc.Hex.parse(ivHex);

      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32, // 256-bit key
        iterations: 100000, // Must match encryption iterations
        hasher: CryptoJS.algo.SHA256,
      });

      const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      });
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

      if (!plaintext) {
        throw new Error("Invalid password");
      }

      return plaintext;
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Invalid password or corrupted data");
    }
  }

  const handlePasswordSubmit = async (enteredPassword) => {
    try {
      secureDecrypt(initialEncryptedText, enteredPassword);
      passRef.current = enteredPassword;
      setStartListening(true);
      setHasSavedBefore(true);
      setPasswordPopupOpen(false);
    } catch (e) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Incorrect Password!",
      });
    }
  };

  const copyUrl = () => {
    window.navigator.clipboard.writeText(shareableUrl);
  };

  const deleteDocument = async () => {
    if (!navigator.onLine) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "No internet connection!",
      });
      return;
    }
    try {
      await deleteDoc(doc(db, "text", docIdRef.current));
      localStorage.removeItem("Url");
      setSaving(false);
      setType("text");
      setValue("");
      setfile([]);
      setUrls([]);
      setBtnText("Save");
      docIdRef.current = null;
      passRef.current = null;
      setReadonly(false);
      setShareableUrl("");
      navigate("/");
      messageApi.destroy();
      messageApi.open({
        type: "success",
        content: "Document deleted successfully",
      });
    } catch (error) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content: "Failed to delete document",
      });
      console.error("Error deleting document: ", error);

    }
  };

  const openDocFromList = (docItem) => {
    const params = new URLSearchParams();
    params.set("id", docItem.id);

    if (docItem.isProtected) {
      params.set("protected", "true");
    }

    navigate(`/?${params.toString()}`);
  };

  const copyDocLink = async (docItem) => {
    const params = new URLSearchParams();
    params.set("id", docItem.id);

    if (docItem.isProtected) {
      params.set("protected", "true");
    }

    await window.navigator.clipboard.writeText(`${window.location.origin}/?${params.toString()}`);
    messageApi.destroy();
    messageApi.open({
      type: "success",
      content: "Link copied",
    });
  };

  const formatDocPreview = (docItem) => {
    // Check if protected via field or if text looks encrypted (contains | separators)
    const isProtected = docItem.isProtected || (docItem.text && docItem.text.includes("|") && docItem.text.split("|").length === 3);
    if (isProtected) {
      return "Protected document";
    }

    if (docItem.text && docItem.text.length) {
      return docItem.text.slice(0, 90);
    }

    if (docItem.file?.length) {
      return `${docItem.file.length} file${docItem.file.length > 1 ? "s" : ""}`;
    }

    return "Empty document";
  };

  const formatDocDate = (value) => {
    if (!value) return "Just now";

    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className='main-container app-workspace w-full flex flex-col mb-10 rounded-3xl'>
      <div className='workspace-hero'>
        <div>
          <p className='eyebrow'>Private workspace</p>
          <h2>Send text and files in a clean, focused flow.</h2>
        </div>
        <p className='workspace-copy'>
          Keep your share links, notes, and files in one place with a softer interface that matches the rest of the product.
        </p>
      </div>

      <div className='workspace-panel rounded-3xl overflow-hidden relative'>
        {contextHolder}
        <PopUp
          open={savePopup}
          onClose={() => setSavePopup(false)}
          onSave={(password, readonly) => onPopupSave(password, readonly)}
          ref={popupSaveRef}
        />
        <PasswordPopup
          open={passwordPopupOpen}
          onSubmit={(password) => handlePasswordSubmit(password)}
        />

        {isLockedProtectedDoc ? (
          <div className='protected-lock-view'>
            <p className='eyebrow'>Protected document</p>
            <h2>This share is locked until the password is entered.</h2>
            <p>
              The encrypted content stays hidden until it is successfully unlocked.
            </p>
          </div>
        ) : (
          <>
            <div className='left-section flex flex-col-reverse md:flex-row sticky top-0 left-0 right-0 md:items-center md:justify-between'>
              <div className='flex p-5 px-8.5 items-baseline'>
                <h1 className='text-3xl md:text-4xl lg:text-5xl font-medium uppercase'>
                  {type === "text" ? "Text" : "File"}
                </h1>
              </div>
              <div className='flex w-full md:w-auto'>
                <div
                  className={`text-3xl md:text-4xl ${type === "text" ? "switcher active w-1/2 md:w-auto  flex md:block md:p-8 justify-center py-4 bg-black/20 md:bg-transparent" : "switcher w-1/2 md:w-auto md:p-8 flex justify-center py-4"}`}
                  onClick={() => setType("text")}
                >
                  {type === "file" ? (
                    <LuText />
                  ) : (
                    <LuLetterText className='tab-Icons' />
                  )}
                </div>
                <div
                  className={`text-3xl md:text-4xl ${type === "file" ? "switcher active w-1/2 md:w-auto  flex md:block md:p-8 justify-center py-4 bg-black/20 md:bg-transparent" : "switcher w-1/2 md:w-auto md:p-8 flex justify-center py-4"}`}
                  onClick={() => setType("file")}
                >
                  {type === "text" ? (
                    <LuFile />
                  ) : (
                    <LuFiles className='tab-Icons' />
                  )}
                </div>
              </div>
            </div>
            {type === "text" ? (
              <div className='right-section px-9  md:py-2 min-h-72 rounded-b-2xl'>
                <TextArea
                  ref={textAreaRef}
                  value={value}
                  disabled={isReadOnlyDoc}
                  onChangeText={(value) => {
                    if (isReadOnlyDoc) return;
                    setValue(value);
                    setBtnText("Save");
                  }}
                />

                {urls.length > 0 ? (
                  <div className='urls-container flex flex-col gap-1'>
                    {urls.length
                      ? urls.map((url, i) => (
                        <a key={i} href={url} target='_blank'>
                          {url}
                        </a>
                      ))
                      : ""}
                  </div>
                ) : (
                  ""
                )}
              </div>
            ) : (
              <div className='right-section min-h-65 h-65 px-8 py-8'>
                {file.length ? (
                  <div className='withFiles flex flex-wrap min-h-60'>
                    <FileList downloadFun={base64ToBlob} files={file} onDrop={onDrop} />
                    <Dropzone
                      onDrop={onDrop}
                      className={`dropzone`}
                      disabled={isReadOnlyDoc}
                      title={
                        <div className='dropzone-text'>
                          <FaPlus />
                          <div>
                            <span>Add File</span>
                            <span>(upto 5 Mb )</span>
                          </div>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <Dropzone
                    className='dropzone h-60'
                    onDrop={(file) => {
                      onDrop(file);
                    }}
                    disabled={isReadOnlyDoc}
                    title={
                      <p>
                        Drag and drop any files up to 2 files, 5Mbs each or{" "}
                        <span className=''>Browse Upgrade</span> to get more space
                      </p>
                    }
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
      {!isLockedProtectedDoc && (
        <>
          <div className='w-full flex justify-end gap-4 md:gap-5 pt-6 mt-6 pb-6 px-8 save-container rounded-2xl'>
            {value === "" && file.length < 1 && docIdRef.current ? (
              <button
                disabled={isReadOnlyDoc}
                className='clear-btn p-2 md:py-3 px-10 md:px-15  cursor-pointer rounded-lg md:text-lg capitalize hover:scale-102 disabled:bg-gray-500'
                onClick={deleteDocument}
              >
                Delete doc
              </button>
            ) : ''}
            {(type === 'text' || file.length < 1) && (value === "") ? (
              ""
            ) : (
              <button
                disabled={isReadOnlyDoc}
                className='clear-btn p-2 md:py-3 px-10 md:px-15  cursor-pointer rounded-lg md:text-lg capitalize hover:scale-102 disabled:bg-gray-500'
                onClick={clearText}
              >
                clear
              </button>
            )}
            {type === "file" && file.length > 0 && docIdRef.current ? (
              <Button
                onClick={() => {
                  downloadFiles();
                }}
                disable={saving || (isReadOnlyDoc || (value === "" && file.length < 1) ? true : false) || (type === "text" && value === '')}
                children={'Download All'}
              />) : (
              <Button
                onClick={() => {
                  saveTextBtn();
                }}
                disable={(isReadOnlyDoc || (value === "" && file.length < 1) ? true : false) || (type === "text" && value === '')}
                children={btnText}
              />
            )}
          </div>
          <div className="p-8 pb-4 pt-0 ">
            {docIdRef.current ? (
              <SharedUrl
                copyUrl={copyUrl}
                popoverContent={popoverContent}
                shareableUrl={shareableUrl}
              />
            ) : (
              ""
            )}
          </div>
        </>
      )}

      {user && !isLockedProtectedDoc && (
        <div className="docs-panel rounded-3xl mt-6 p-6 md:p-8">
          <div className="docs-panel-header">
            <div>
              <p className="eyebrow">Your docs</p>
              <h3>Recover anything you created from this account.</h3>
            </div>
            <span>{docsLoading ? "Loading..." : `${myDocs.length} saved`}</span>
          </div>

          {myDocs.length ? (
            <div className="docs-list">
              {myDocs.map((docItem) => (
                <article className="doc-card" key={docItem.id}>
                  <div className="doc-card-copy">
                    <div className="doc-card-meta">
                      <strong>{docItem.isProtected ? "Protected" : "Open"}</strong>
                      <span>{docItem.readonly ? "Read-only" : "Editable"}</span>
                    </div>
                    <h4>{docItem.file?.length ? `${docItem.file.length} file share` : "Text note"}</h4>
                    <p>{formatDocPreview(docItem)}</p>
                  </div>

                  <div className="doc-card-footer">
                    <span>{formatDocDate(docItem.createdAt)}</span>
                    <div className="doc-card-actions">
                      <button type="button" onClick={() => copyDocLink(docItem)}>
                        Copy link
                      </button>
                      <button type="button" onClick={() => openDocFromList(docItem)}>
                        Open
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="docs-empty">
              <p>No saved docs yet. Your next save will appear here automatically.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;


