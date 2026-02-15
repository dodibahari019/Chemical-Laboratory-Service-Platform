// import React from "react";

// const Modal = ({ bodyModal }) => {
//     return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
//       {bodyModal}
//     </div>
//   );
// }

// export default Modal;
import React from "react";

const Modal = ({ bodyModal }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div
        style={{
          maxHeight: "90vh",
          maxWidth: "600px", // batasi lebar modal
          width: "100%",      // agar responsive di mobile
          overflowY: "auto",
          padding: "0.1rem",    // beri padding agar isi tidak mepet
          backgroundColor: "white",
          borderRadius: "0.75rem", // setara rounded-xl
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          msOverflowStyle: "none", /* IE & Edge */
          scrollbarWidth: "none"   /* Firefox */
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {bodyModal}
      </div>
    </div>
  );
};

export default Modal;
