import Swal from 'sweetalert2';

// Success alert
export const showSuccess = (title, message = '') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false
  });
};

// Error alert
export const showError = (title, message = '') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonText: 'ตกลง'
  });
};

// Warning alert
export const showWarning = (title, message = '') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonText: 'ตกลง'
  });
};

// Info alert
export const showInfo = (title, message = '') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonText: 'ตกลง'
  });
};

// Confirmation dialog
export const showConfirm = (title, message = '', confirmText = 'ยืนยัน', cancelText = 'ยกเลิก') => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });
};

// Delete confirmation
export const showDeleteConfirm = (title = 'ยืนยันการลบ', message = 'คุณต้องการลบรายการนี้หรือไม่?') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    reverseButtons: true
  });
};

// Loading alert
export const showLoading = (title = 'กำลังโหลด...') => {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

// Toast notification
export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon: icon,
    title: title
  });
};

// Input dialog
export const showInput = (title, inputLabel = '', inputPlaceholder = '', inputType = 'text') => {
  return Swal.fire({
    title: title,
    input: inputType,
    inputLabel: inputLabel,
    inputPlaceholder: inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    inputValidator: (value) => {
      if (!value) {
        return 'กรุณากรอกข้อมูล!';
      }
    }
  });
};

// Number input dialog
export const showNumberInput = (title, inputLabel = '', min = 0, max = 999999) => {
  return Swal.fire({
    title: title,
    input: 'number',
    inputLabel: inputLabel,
    inputPlaceholder: inputLabel,
    inputAttributes: {
      min: min,
      max: max
    },
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    inputValidator: (value) => {
      if (!value) {
        return 'กรุณากรอกจำนวน!';
      }
      if (value < min) {
        return `จำนวนต้องไม่น้อยกว่า ${min}!`;
      }
      if (value > max) {
        return `จำนวนต้องไม่เกิน ${max}!`;
      }
    }
  });
};

// Select dialog
export const showSelect = (title, options = {}, inputLabel = 'เลือกตัวเลือก') => {
  return Swal.fire({
    title: title,
    input: 'select',
    inputLabel: inputLabel,
    inputOptions: options,
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    inputValidator: (value) => {
      if (!value) {
        return 'กรุณาเลือกตัวเลือก!';
      }
    }
  });
};

// Custom alert with custom styling
export const showCustomAlert = (options) => {
  return Swal.fire({
    confirmButtonText: 'ตกลง',
    ...options
  });
};

// Success toast
export const showSuccessToast = (message) => {
  return showToast(message, 'success');
};

// Error toast
export const showErrorToast = (message) => {
  return showToast(message, 'error');
};

// Warning toast
export const showWarningToast = (message) => {
  return showToast(message, 'warning');
};

// Info toast
export const showInfoToast = (message) => {
  return showToast(message, 'info');
};
