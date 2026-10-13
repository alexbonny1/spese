import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

const corners = (
  <>
    <i className="corner tl" />
    <i className="corner tr" />
    <i className="corner bl" />
    <i className="corner br" />
  </>
);

interface BlueprintDivProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div';
  children?: ReactNode;
}

interface BlueprintButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as: 'button';
  children?: ReactNode;
}

type BlueprintProps = BlueprintDivProps | BlueprintButtonProps;

/** Riquadro con bordo hairline e crocette "+" ai 4 angoli, come da design system "Industry". */
export function Blueprint({ as = 'div', className = '', children, ...rest }: BlueprintProps) {
  const cls = `blueprint ${className}`.trim();
  if (as === 'button') {
    return (
      <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {corners}
        {children}
      </button>
    );
  }
  return (
    <div className={cls} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {corners}
      {children}
    </div>
  );
}
