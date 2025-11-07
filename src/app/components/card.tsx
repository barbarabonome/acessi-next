type CardProps = {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
};

const Card = ({ icone, titulo, descricao }: CardProps) => {
  return (
    <div className="bg-gray-200 dark:bg-gray-600 dark:text-white border border-white rounded-full shadow-md p-4 h-full flex flex-col justify-between pl-10">
      <div className="text-3xl mb-2">{icone}</div>
      <h3 className="text-lg font-semibold mb-1">{titulo}</h3>
      <p className="text-sm text-black dark:text-white">{descricao}</p>
    </div>
  );
};

export default Card;
