import * as React from "react";
import {
  Component, Children, ReactElement, HTMLAttributes,
  ComponentClass, StatelessComponent, cloneElement,
} from "react";
import * as TransitionGroup from "react-transition-group/TransitionGroup";

import { CSSTransitionProps } from "./csstransition";

export interface CSSTransitionGroupProps extends
  HTMLAttributes<any> {
  transitionAppear?: boolean;
  component?: string | ComponentClass<any> | StatelessComponent<any>;
  children?: ReactElement<CSSTransitionProps> | Array<ReactElement<CSSTransitionProps>>;
}

export class CSSTransitionGroup extends Component<CSSTransitionGroupProps, {}> {
  public static defaultProps: any = {
    component: "div",
  };
  private mounted = false;
  public componentDidMount() {
    this.mounted = true;
  }

  public render() {
    const { transitionAppear, children, ...rest } = this.props as any;
    return (
      <TransitionGroup {...rest}>
        {Children.map(children, (child: ReactElement<any>, index) =>
          <CSSTransitionGroupChild
            transitionAppear={transitionAppear}
            mounted={this.mounted}
            key={child.key}>
            {child}
          </CSSTransitionGroupChild>,
        )}
      </TransitionGroup>);
  }
}

export interface CSSTransitionGroupChildProps {
  transitionAppear?: boolean;
  mounted?: boolean;
  children?: ReactElement<any>;
}

export class CSSTransitionGroupChild extends Component<CSSTransitionGroupChildProps, CSSTransitionProps> {
  public static defaultProps: any = {
    transitionAppear: false,
  };
  private leaveDone: () => void;

  constructor(props: any) {
    super(props);
    this.state = {
      active: true,
      transitionAppear: props.mounted || props.transitionAppear,
    };
  }

  public componentWillAppear(done: () => void) {
    done();
  }

  public componentWillEnter(done: () => void) {
    // component was leaving but was interrupted.
    if (!this.state.active) {
      this.setState({ active: true });
      this.leaveDone = null;
    }
    done();
  }

  public componentWillLeave(done: () => void) {
    this.setState({ active: false });
    this.leaveDone = done;
  }

  public render() {
    const { props: {children}, state: { active, transitionAppear}, onTransitionComplete } = this;
    return cloneElement(
      Children.only(children),
      { active, transitionAppear, onTransitionComplete },
    );
  }

  private onTransitionComplete = () => {
    const child = Children.only(this.props.children);
    if (child.props.onTransitionComplete) { child.props.onTransitionComplete(); }
    if (this.leaveDone) { this.leaveDone(); }
  }
}
