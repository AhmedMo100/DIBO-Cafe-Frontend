type CardProps = {
    title: string;
    children: React.ReactNode;
};

const Card = ({ title, children }: CardProps) => {
    return (
        <div style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}>
            <h3>{title}</h3>
            <div>{children}</div>
        </div>
    );
};

export default Card;
