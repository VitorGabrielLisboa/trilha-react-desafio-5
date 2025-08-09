import styles from "./styles.module.css";
import { Control, Controller } from "react-hook-form";

export const Input = ({ title, name, type, erro, icon, control }) => {
  return (
    <div className={styles.inputContainer}>
      <div>
        {icon ? icon : ""}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <input
              placeholder={title}
              type={type}
              required
              autoComplete="off"
              {...field}
            />
          )}
        />
      </div>
      {erro ? <span>{erro}</span> : ""}
    </div>
  );
};
