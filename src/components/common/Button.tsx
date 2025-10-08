type ButtonProps = {
    label: string;
    onClick?: () => void;
};

const Button = ({ label, onClick }: ButtonProps) => {
    return (
        <button onClick={onClick} style={{ padding: "10px 20px" }}>
            {label}
        </button>
    );
};

export default Button;
