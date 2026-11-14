/** Banner used for form and upload feedback. Renders the same markup/classes as the old pages. */
export default function Alert({ message, type = "error" }) {
  return (
    <div className={message ? `alert show alert-${type}` : "alert"} role={type === "error" ? "alert" : "status"}>
      {message}
    </div>
  );
}
