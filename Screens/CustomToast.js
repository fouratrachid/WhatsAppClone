import React from 'react';
import Toast from 'react-native-toast-message';

const CustomToast = React.forwardRef((props, ref) => (
    <Toast ref={ref} {...props} />
));

export default CustomToast;