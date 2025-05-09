import React, { useContext, useState, useEffect } from 'react';
import { StepperContext } from '../../../context/StepperContext';
import { useSession } from 'next-auth/react';


const Form = () => {
  const { state, dispatch } = useContext(StepperContext);
  const { data: session, status } = useSession();

  // Controlamos si el autocompletado ya se ha hecho
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);

  // Estado local inicializado con los datos globales o vacío si no existen
  const [formData, setFormData] = useState({
    name: state.name || '',
    telephone: state.telephone || '',
    email: state.email || '',
    companyOrTypeOfWork: state.companyOrTypeOfWork || '',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    telephone: '',
    email: '',
    companyOrTypeOfWork: '',
  });

  const [touchedFields, setTouchedFields] = useState({
    name: false,
    telephone: false,
    email: false,
    companyOrTypeOfWork: false,
  });

  // Autocompletar solo si los campos están vacíos y aún no se ha autocompletado
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !hasAutoCompleted) {
      const updatedFormData = {
        email: session?.user?.email || '',
        name: session?.user?.name || '',
        telephone: session?.user?.telephone || '',
        companyOrTypeOfWork: session?.user?.companyOrTypeOfWork || '',
      };

    // Solo autocompletar y guardar si el campo está vacío en el estado local y global
    setFormData((prevData) => ({
      ...prevData,
      email: prevData.email || state.email || updatedFormData.email,
      name: prevData.name || state.name || updatedFormData.name,
      telephone: prevData.telephone || state.telephone || updatedFormData.telephone,
      companyOrTypeOfWork: prevData.companyOrTypeOfWork || state.companyOrTypeOfWork || updatedFormData.companyOrTypeOfWork,
    }));

      // Marcar los campos como tocados si se autocompletaron
      setTouchedFields((prevTouched) => ({
        ...prevTouched,
        email: !!updatedFormData.email,
        name: !!updatedFormData.name,
        telephone: !!updatedFormData.telephone,
        companyOrTypeOfWork: !!updatedFormData.companyOrTypeOfWork,
      }));

      // Validar los campos después de autocompletar
      Object.keys(updatedFormData).forEach((fieldName) => {
        if (updatedFormData[fieldName]) {
          validateField(fieldName, updatedFormData[fieldName]);
        }
      });

      // Comprobar si todos los campos están completos y no tienen errores
      const allFieldsFilled = Object.values(updatedFormData).every((field) => field !== '');
      const noErrors = Object.values(formErrors).every((error) => error === '');

      if (allFieldsFilled && noErrors) {
        dispatch({
          type: 'COMPLETE_STEP',
          step: 'form',
          completed: true,
        });
      }

      // Guardar los campos autocompletados en el estado global si están vacíos
    if (!state.email && updatedFormData.email) {
      dispatch({ type: 'SET_FORM_EMAIL', payload: updatedFormData.email });
    }
    if (!state.name && updatedFormData.name) {
      dispatch({ type: 'SET_FORM_NAME', payload: updatedFormData.name });
    }
    if (!state.telephone && updatedFormData.telephone) {
      dispatch({ type: 'SET_FORM_TELEPHONE', payload: updatedFormData.telephone });
    }
    if (!state.companyOrTypeOfWork && updatedFormData.companyOrTypeOfWork) {
      dispatch({ type: 'SET_FORM_COMPANYORTYPEOFWORK', payload: updatedFormData.companyOrTypeOfWork });
    }
      // Marcar que el autocompletado ya se hizo
      setHasAutoCompleted(true);
    }
  }, [session, status, dispatch, hasAutoCompleted, formErrors]);

  const prohibitedCharsRegex = /['"\\//<>{}]/;
  const containsNumber = /\d/;
  const containsLetter = /[a-zA-Z]/;

  const validateField = (name, value) => {
    let error = '';

    if (value?.trim() === '') {
      switch (name) {
        case 'name':
          error = 'El campo nombre no puede estar vacío.';
          break;
        case 'telephone':
          error = 'El campo teléfono no puede estar vacío.';
          break;
        case 'email':
          error = 'El campo email no puede estar vacío.';
          break;
        case 'companyOrTypeOfWork':
          error = 'El campo empresa o tipo de trabajo no puede estar vacío.';
          break;
        default:
          error = `El campo ${name} no puede estar vacío.`;
          break;
      }
    } else {
      switch (name) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'El email no es válido.';
          }
          break;
        case 'name':
          if (prohibitedCharsRegex.test(value)) {
            error = 'El nombre contiene caracteres no permitidos.';
          } else if (containsNumber.test(value)) {
            error = 'El nombre no puede contener números.';
          } else if (value.trim().length < 3) {
            error = 'El nombre debe tener al menos 3 caracteres.';
          }
          break;
        case 'telephone':
          if (value.trim() !== '' && containsLetter.test(value)) {
            error = 'El teléfono no puede contener letras.';
          } else if (prohibitedCharsRegex.test(value)) {
            error = 'El teléfono contiene caracteres no permitidos.';
          } else if (value.length > 25) {
            error = 'El teléfono no puede ser mayor de 25 caracteres.';
          }
          break;
        case 'companyOrTypeOfWork':
          if (value.trim() !== '' && prohibitedCharsRegex.test(value)) {
            error = 'El campo Empresa o Rubro contiene caracteres no permitidos.';
          } else if (value.length > 100) {
            error = 'El campo empresa o rubro no puede ser mayor de 100 caracteres.';
          }
          break;
        default:
          break;
      }
    }

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));

    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (!touchedFields[name]) {
      setTouchedFields((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));
    }

    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    dispatch({ type: `SET_FORM_${name.toUpperCase()}`, payload: value });

    if (touchedFields[name]) {
      validateField(name, value);
    }

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    let allFieldsFilled = true;
    let hasErrors = false;

    for (const fieldName in updatedFormData) {
      const fieldValue = updatedFormData[fieldName].trim();
      if (fieldValue === '') {
        allFieldsFilled = false;
        break;
      }

      const error = validateField(fieldName, fieldValue);
      if (error) {
        hasErrors = true;
        break;
      }
    }

    if (allFieldsFilled && !hasErrors) {
      dispatch({
        type: 'COMPLETE_STEP',
        step: 'form',
        completed: true,
      });
    } else {
      dispatch({
        type: 'COMPLETE_STEP',
        step: 'form',
        completed: false,
      });
    }
  };

  return (
    <div className='flex flex-col justify-center w-full px-6 sm:px-20'>
      <div className='space-y-4 py-8'>
        <div className='flex flex-row gap-2'>
          <div className='w-full'>
            <label className='block text-sm font-medium text-gray-700'>Nombre:</label>
            <input
              className={`w-full border px-3 py-2 rounded-lg shadow-sm  ${
                formErrors.name ? 'border-red-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              type='text'
              name='name'
              placeholder='Nombre'
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur} // Añadido el evento onBlur
            />
            {touchedFields.name && formErrors.name && (
              <span className='text-red-500 text-xs sm:text-sm'>{formErrors.name}</span>
            )}
          </div>
          <div className='w-full'>
            <label className='block text-sm font-medium text-gray-700'>Teléfono:</label>
            <input
              className={`w-full border px-3 py-2 rounded-lg shadow-sm  ${
                formErrors.telephone ? 'border-red-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              type='text'
              name='telephone'
              placeholder='Número de ref'
              value={formData.telephone}
              onChange={handleChange}
              onBlur={handleBlur} // Añadido el evento onBlur
            />
            {touchedFields.telephone && formErrors.telephone && (
              <span className='text-red-500 text-xs sm:text-sm'>{formErrors.telephone}</span>
            )}
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>Email:</label>
          <input
            className={`w-full border px-3 py-2 rounded-lg shadow-sm  ${
              formErrors.email ? 'border-red-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
            type='email'
            name='email'
            placeholder='Correo electrónico'
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur} // Añadido el evento onBlur
          />
          {touchedFields.email && formErrors.email && (
            <span className='text-red-500 text-xs sm:text-sm'>{formErrors.email}</span>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>Empresa o Rubro:</label>
          <input
            className={`w-full border px-3 py-2 rounded-lg shadow-sm  ${
              formErrors.companyOrTypeOfWork ? 'border-red-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
            type='text'
            name='companyOrTypeOfWork'
            placeholder='Nombre de empresa o rubro'
            value={formData.companyOrTypeOfWork}
            onChange={handleChange}
            onBlur={handleBlur} // Añadido el evento onBlur
          />
          {touchedFields.companyOrTypeOfWork && formErrors.companyOrTypeOfWork && (
            <span className='text-red-500 text-xs sm:text-sm'>{formErrors.companyOrTypeOfWork}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;