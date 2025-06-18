import { createContext, useContext, useState } from 'react';

interface ValidationState {
  isValid: boolean;
  message?: string;
}

interface FieldValidations {
  email: ValidationState;
  password: ValidationState;
  name?: ValidationState;
}

interface FormData {
  email: string;
  password: string;
  name?: string;
}

interface TouchedFields {
  [key: string]: boolean;
}

interface AuthContextType {
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
  isLoading: { [key: string]: boolean };
  setFieldLoading: (field: string, loading: boolean) => void;
  clearForm: () => void;
  validations: FieldValidations;
  validateField: (field: keyof FormData, value: string) => void;
  touchedFields: TouchedFields;
  setFieldTouched: (field: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function validateEmail(email: string): ValidationState {
  if (!email) return { isValid: false };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true };
}

function validatePassword(password: string): ValidationState {
  if (!password) return { isValid: false };
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
}

function validateName(name: string): ValidationState {
  if (!name) return { isValid: false };
  if (name.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s]*$/.test(name)) {
    return { isValid: false, message: 'Name can only contain letters and spaces' };
  }
  return { isValid: true };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormDataState] = useState<FormData>({
    email: '',
    password: '',
    name: '',
  });

  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [validations, setValidations] = useState<FieldValidations>({
    email: { isValid: false },
    password: { isValid: false },
    name: { isValid: false },
  });
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});

  const setFieldTouched = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field: keyof FormData, value: string) => {
    let validation: ValidationState;

    switch (field) {
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'name':
        validation = validateName(value);
        break;
      default:
        validation = { isValid: false };
    }

    setValidations(prev => ({
      ...prev,
      [field]: validation
    }));
  };

  const setFormData = (data: Partial<FormData>) => {
    setFormDataState(prev => {
      const newData = { ...prev, ...data };
      // Validate the changed fields
      Object.entries(data).forEach(([field, value]) => {
        validateField(field as keyof FormData, value);
        // Mark field as touched when value changes
        setFieldTouched(field);
      });
      return newData;
    });
  };

  const setFieldLoading = (field: string, loading: boolean) => {
    setIsLoading(prev => ({ ...prev, [field]: loading }));
  };

  const clearForm = () => {
    setFormDataState({
      email: '',
      password: '',
      name: '',
    });
    setIsLoading({});
    setValidations({
      email: { isValid: false },
      password: { isValid: false },
      name: { isValid: false },
    });
    setTouchedFields({});
  };

  return (
    <AuthContext.Provider value={{ 
      formData, 
      setFormData, 
      isLoading, 
      setFieldLoading, 
      clearForm,
      validations,
      validateField,
      touchedFields,
      setFieldTouched
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 