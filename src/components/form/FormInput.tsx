"use client";

import _ from "lodash";
import { BaseSyntheticEvent, ReactElement, cloneElement, isValidElement } from "react";
import { Box, Button, Typography } from "@mui/material";
import { FieldValues, UseControllerProps, useController } from "react-hook-form";

export interface IFormInputProps<T extends FieldValues, P extends object = any> extends UseControllerProps<T> {
  label?: string | ReactElement;
  component: ReactElement<P>;
  debug?: boolean;
  fnOnChange?: (event: BaseSyntheticEvent<T>, value?: T, reason?: string, details?: string) => void;
}

/** Custom Form Input for react-hook-form and MUI */
export const FormInput = <T extends FieldValues, P extends object = any>(props: IFormInputProps<T, P>) => {
  const { field, fieldState } = useController(props);
  const fieldValue = field.value ?? "";

  return (
    <Box className="flex flex-col gap-1">
      {props.label && !isValidElement(props.label) && (
        <Typography className="font-medium" variant="body1">
          {props.label}
          {props.rules?.required && <span className="align-top text-red-500">*</span>}
        </Typography>
      )}
      {props.label && isValidElement(props.label) && <>{props.label}</>}
      {props.component &&
        cloneElement<P>(props.component, {
          ...field,
          value: fieldValue,
          required: props.rules?.required,
          onChange: props.fnOnChange ?? field.onChange,
        } as P)}
      {!_.isEmpty(fieldState.error) && fieldState.error?.message && (
        <Typography className="text-red-500" variant="body2">
          {fieldState.error.message}
        </Typography>
      )}
      {props.debug && (
        <>
          <Box>{fieldState.isTouched ? "Touched" : "Not Touched"}</Box>
          <Box>{fieldState.isDirty ? "Dirty" : "Not Dirty"}</Box>
          <Box>{!fieldState.invalid ? "Valid" : "Not Valid"}</Box>
          <Box>{fieldState.error ? "Error" : "No Error"}</Box>
          <Button onClick={() => console.log(field)}>Field</Button>
        </>
      )}
    </Box>
  );
};

export default FormInput;
