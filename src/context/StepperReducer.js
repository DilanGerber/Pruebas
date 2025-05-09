export const initialState = {
    dates: [],
    officeId: "",
    name: '',
    telephone: '',
    email: '',
    companyOrTypeOfWork: '',
    paymentData: {},
    selectedDates: [],
    range: { from: null, to: null }, // Nueva propiedad
    selectedHours: [], // Nueva propiedad
    calendarMode: "range",
    isReservationConfirmed: false, // Nueva propiedad
    stepsCompleted: {
        calendar: false,
        form: false,
        payment: false,
    },
    currentStep: 1,
    checkoutStatus: null,
  }
  
  export const stepperReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_CALENDAR_DATA':
          return {
            ...state,
            dates: action.payload,
          };
        case 'SET_OFFICE_ID':
          return {
            ...state,
            officeId: action.payload,  // Actualiza officeId en el estado
          };
        case 'SET_FORM_DATA':
          return {
            ...state,
            formData: action.payload,
          };
        case 'SET_PAYMENT_DATA':
          return {
            ...state,
            paymentData: action.payload,
          };
          case 'SET_RANGE':
            return {
              ...state,
              range: action.payload,
            };
            case 'SET_SELECTED_DATES':
              return {
                ...state,
                selectedDates: action.payload,
              };
          case 'SET_SELECTED_HOURS':
            return {
              ...state,
              selectedHours: action.payload,
            };
            case 'SET_CALENDAR_MODE':
    return {
      ...state,
      calendarMode: action.payload,
    };
          case 'CONFIRM_RESERVATION':
            return {
              ...state,
              isReservationConfirmed: action.payload,
            };      
            case 'SET_FORM_NAME':
              return { ...state, name: action.payload };
            case 'SET_FORM_TELEPHONE':
              return { ...state, telephone: action.payload };
            case 'SET_FORM_EMAIL':
              return { ...state, email: action.payload };
            case 'SET_FORM_COMPANYORTYPEOFWORK':
              return { ...state, companyOrTypeOfWork: action.payload };
        case 'COMPLETE_STEP':
          return {
            ...state,
            stepsCompleted: {
              ...state.stepsCompleted,
              [action.step]: action.completed,
            },
          };
        case 'SET_CURRENT_STEP':
          return {
            ...state,
            currentStep: action.step,
            checkoutStatus: null
          };
        case 'CHECKOUT_SUCCESS':
            return {
              ...state,
              stepsCompleted: {
                ...state.stepsCompleted,
                payment: true // Marca el paso de Payment como completado
            },
              checkoutStatus: 'success',
            };
        case 'CHECKOUT_ERROR':
            return {
              ...state,
              checkoutStatus: 'error',
            };
        case 'RETRY_CHECKOUT':
          return {
              ...state,
              currentStep: 3,
              checkoutStatus: null 
            };
        default:
            return state;
    }
};