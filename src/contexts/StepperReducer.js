export const initialState = {
    calendarData: {},
    formData: {},
    paymentData: {},
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
            calendarData: action.payload,
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
        case 'COMPLETE_STEP':
          return {
            ...state,
            stepsCompleted: {
              ...state.stepsCompleted,
              [action.step]: true,
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
