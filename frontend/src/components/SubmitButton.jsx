/** Primary button with the inline spinner used on every form. */
export default function SubmitButton({ loading, loadingText, children, id, ...rest }) {
  return (
    <button className="btn btn-primary" id={id} disabled={loading} {...rest}>
      <span className={loading ? "spinner show" : "spinner"} aria-hidden="true" />
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}
