const LoadingIcon = () => {
  return (
    <div style={{ clear: "both", height: 24, width: 24 }}>
      <svg
        version="1.1"
        id="L5"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width={24}
        height={24}
        viewBox="0 0 100 100"
      >
        <circle fill="#000" stroke="none" cx="6" cy="50" r="6">
          <animateTransform
            attributeName="transform"
            dur="0.7s"
            type="translate"
            values="0 15 ; 0 -15; 0 15"
            repeatCount="indefinite"
            begin="0.1"
          ></animateTransform>
        </circle>
        <circle fill="#000" stroke="none" cx="30" cy="50" r="6">
          <animateTransform
            attributeName="transform"
            dur="0.7s"
            type="translate"
            values="0 10 ; 0 -10; 0 10"
            repeatCount="indefinite"
            begin="0.2"
          ></animateTransform>
        </circle>
        <circle fill="#000" stroke="none" cx="54" cy="50" r="6">
          <animateTransform
            attributeName="transform"
            dur="0.7s"
            type="translate"
            values="0 5 ; 0 -5; 0 5"
            repeatCount="indefinite"
            begin="0.3"
          ></animateTransform>
        </circle>
      </svg>
    </div>
  );
};

export default LoadingIcon;
