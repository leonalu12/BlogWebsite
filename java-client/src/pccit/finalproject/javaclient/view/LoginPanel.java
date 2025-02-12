package pccit.finalproject.javaclient.view;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;

import pccit.finalproject.javaclient.utils.*;
public class LoginPanel extends JPanel {
    private static JTextField usernameField;
    private static JPasswordField passwordField;
    private JButton loginButton;
    private JButton logoutButton;
    private JButton deleteButton;
    private boolean isLoggedIn = false;
    private String username;
    private List<LoginStateObserver> observers= new ArrayList<>();

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
    public void setLoginAction(ActionListener action) {
        loginButton.addActionListener(action); }
    public void setLogoutAction(ActionListener action) {
        logoutButton.addActionListener(action); }
    public void setDeleteAction(ActionListener listener) {
        deleteButton.addActionListener(listener);}
    public void setLoggedInState(boolean isLoggedIn,String username) {
        this.isLoggedIn = isLoggedIn;
//        updateUIState(loggedIn, username);

        this.username = username;
        notifyObservers();
    }
//    private void updateUIState(boolean loggedIn, String username) {
//        loginButton.setEnabled(!loggedIn);
//        logoutButton.setEnabled(loggedIn);
//
//        // Only enable deleteButton if logged in AND username is NOT "admin"
//        deleteButton.setEnabled(loggedIn && !"admin".equals(username));
//        usernameField.setEnabled(!loggedIn);
//        passwordField.setEnabled(!loggedIn);
//    }
    // Method to set the state of buttons
    public void setButtonState(boolean loginEnabled, boolean logoutEnabled, boolean deleteEnabled) {
        loginButton.setEnabled(loginEnabled);
        logoutButton.setEnabled(logoutEnabled);
        deleteButton.setEnabled(deleteEnabled);
    }
    public void clearFields() {
        usernameField.setText("");
        passwordField.setText("");
    }
    public void addObserver(LoginStateObserver observer){
        observers.add(observer);}
    public void removeObserver(LoginStateObserver observer){
        observers.remove(observer);
    }
    public void notifyObservers(){
        for(LoginStateObserver observer: observers){
            observer.onLoginStateChanged(isLoggedIn,username);
        }
    }

}
