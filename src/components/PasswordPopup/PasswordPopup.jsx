import React, { useState } from "react";
import { Modal, Input, Button } from "antd";
import './style.scss'

const PasswordPopup = ({ open, onSubmit }) => {
  const [password, setPassword] = useState("");

  return (
    <Modal
      open={open}
      title={<p className="pass-popup-title">Enter Password</p>}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
    >
      <Input.Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter document password"
        onPressEnter={() => onSubmit(password)}
      />
      <Button
        type="primary"
        className="mt-4"
        onClick={() => onSubmit(password)}
        block
      >
        Unlock
      </Button>
    </Modal>
  );
};

export default PasswordPopup;
