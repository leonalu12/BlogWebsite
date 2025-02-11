package pccit.finalproject.javaclient.view;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionListener;
import pccit.finalproject.javaclient.utils.*;
public class LoginPanel extends JPanel {
    private static JTextField usernameField;
    private static JPasswordField passwordField;
    private JButton loginButton;
    private JButton logoutButton;
    private JButton deleteButton;
    private boolean isLoggedIn = false;

    public LoginPanel() {
        setLayout(new FlowLayout(FlowLayout.LEFT, 10, 10));
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        add(new JLabel("Username:"));
        usernameField = new JTextField(10);
        add(usernameField);

        add(new JLabel("Password:"));
        passwordField = new JPasswordField(10);
        add(passwordField);

        loginButton = new JButton("Login");
        add(loginButton);

        logoutButton = new JButton("Logout");
        logoutButton.setEnabled(false);
        add(logoutButton);

        deleteButton = new JButton("Delete Admin");
        deleteButton.setEnabled(false);
        add(deleteButton);
    }

    public static String getUsername() { return usernameField.getText(); }
    public static String getPassword() { return new String(passwordField.getPassword()); }
    public void setLoginAction(ActionListener action) { loginButton.addActionListener(action); }
    public void setLogoutAction(ActionListener action) { logoutButton.addActionListener(action); }
    public void setDeleteAction(ActionListener listener) {deleteButton.addActionListener(listener);}
    public void setLoggedInState(boolean loggedIn,String username) {
        this.isLoggedIn = loggedIn;
        updateUIState(loggedIn, username);
    }
    private void updateUIState(boolean loggedIn, String username) {
        loginButton.setEnabled(!loggedIn);
        logoutButton.setEnabled(loggedIn);
        // Only enable deleteButton if logged in AND username is NOT "admin0"
        deleteButton.setEnabled(loggedIn && !"admin".equals(username));
        usernameField.setEnabled(!loggedIn);
        passwordField.setEnabled(!loggedIn);
    }
    public void clearFields() {
        usernameField.setText("");
        passwordField.setText("");
    }
}
