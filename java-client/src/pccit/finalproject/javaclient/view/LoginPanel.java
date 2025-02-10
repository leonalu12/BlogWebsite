package pccit.finalproject.javaclient.view;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionListener;

public class LoginPanel extends JPanel {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JButton logoutButton;

    public LoginPanel() {
        setLayout(new GridLayout(3, 2, 10, 10));

        add(new JLabel("Username:"));
        usernameField = new JTextField();
        add(usernameField);

        add(new JLabel("Password:"));
        passwordField = new JPasswordField();
        add(passwordField);

        loginButton = new JButton("Login");
        add(loginButton);

        logoutButton = new JButton("Logout");
        logoutButton.setEnabled(false);
        add(logoutButton);
    }

    public String getUsername() { return usernameField.getText(); }
    public String getPassword() { return new String(passwordField.getPassword()); }
    public void setLoginAction(ActionListener action) { loginButton.addActionListener(action); }
    public void setLogoutAction(ActionListener action) { logoutButton.addActionListener(action); }
}
