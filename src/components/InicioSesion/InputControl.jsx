import styled from 'styled-components';
// Componente reutilizable para entradas de texto (inputs)
export function InputControl(props) {
  return (
    <Container>
      {/* Si se proporciona una etiqueta (label), la muestra */}
      {props.label && <label>{props.label}</label>}	

      {/* Input de tipo texto que recibe todas las props (como onChange, placeholder, etc.) */}
      <input {...props} />
    </Container>
  );
}


const Container = styled.div`
  /* estilos aquí */
  display: flex;
  flex-direction: column;
  gap: 8px;
  label{
    font-weight: 700;
    font-size: 1rem;
    color:#313131;
  }
  input{
    border-radius: 5px;
    border: 1px solid #dddddd;
    outline: none;
    padding: 10px 15px;
    color: #313131;
  }
  input:hover{
    border-color: #ccc;
  }
  input:focus{
    border-color: #8affff;
  }
`;