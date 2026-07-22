import { Controller, Control, FieldPath } from 'react-hook-form'
import { z } from 'zod'
import { authFormSchema } from '@/lib/utils'

import { Field, FieldContent, FieldLabel, FieldError } from './ui/field'
import { Input } from './ui/input'

const formSchema = authFormSchema('sign-up')

interface CustomInput {
  control: Control<z.infer<typeof formSchema>>,
  name: FieldPath<z.infer<typeof formSchema>>,
  label: string,
  placeholder: string
}

const CustomInput = ({ control, name, label, placeholder }: CustomInput) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error} className="form-item">
          <FieldLabel htmlFor={name} className="form-label">
            {label}
          </FieldLabel>
          <FieldContent className="w-full">
            <Input
              id={name}
              placeholder={placeholder}
              className="input-class"
              type={name === 'password' ? 'password' : 'text'}
              {...field}
            />
            <FieldError
              className="form-message mt-2"
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </FieldContent>
        </Field>
      )}
    />
  )
}

export default CustomInput
