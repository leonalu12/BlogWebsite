package pccit.finalproject.javaclient.view;

import pccit.finalproject.javaclient.controller.AdminController;
import pccit.finalproject.javaclient.model.UserTableModel;

import javax.swing.*;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class AdminDashboard extends JFrame implements LoginStateObserver {
    private JTable userTable;
    private JLabel usernameLabel;
    private JLabel iconLabel;
    private LoginPanel loginPanel;
    private JButton deleteUserButton;
    private AdminController controller;
    private DefaultTableModel tableModel;

    public AdminDashboard() {
        // Set JFrame properties
        setTitle("Admin Dashboard");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Create and add login panel
        loginPanel = new LoginPanel();
        add(loginPanel, BorderLayout.NORTH);
        loginPanel.addObserver(this);

        // Create JTable
        userTable = new JTable();
        add(new JScrollPane(userTable), BorderLayout.CENTER);

        // Create user information panel and place it below the table
        JPanel userInfoPanel = new JPanel();
        userInfoPanel.setLayout(new BoxLayout(userInfoPanel, BoxLayout.Y_AXIS));
        // Use BoxLayout to arrange components vertically

        // Set the size of the user info panel to increase overall height
        userInfoPanel.setPreferredSize(new Dimension(userInfoPanel.getWidth(), 150));
        // Set height to 150px, adjust value to get desired height

        usernameLabel = new JLabel();
        iconLabel = new JLabel();
        deleteUserButton = new JButton("Delete User");
        deleteUserButton.setVisible(false); // Hide initially

        // Center the components
        usernameLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        iconLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        deleteUserButton.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Add username and icon to the panel
        userInfoPanel.add(Box.createVerticalStrut(30)); // Add top margin
        userInfoPanel.add(usernameLabel);
        userInfoPanel.add(Box.createVerticalStrut(10)); // Add space between username and icon
        userInfoPanel.add(iconLabel);
        userInfoPanel.add(Box.createVerticalStrut(10)); // Add space between icon and delete button
        userInfoPanel.add(deleteUserButton);
        userInfoPanel.add(Box.createVerticalStrut(30)); // Add bottom margin

        // Add the user info panel to the SOUTH position of the JFrame
        add(userInfoPanel, BorderLayout.SOUTH);

        // Initialize the controller
        controller = new AdminController(this);

        // Set JTable selection listener
        userTable.getSelectionModel().addListSelectionListener(new ListSelectionListener() {
            @Override
            public void valueChanged(ListSelectionEvent e) {
                int selectedRow = userTable.getSelectedRow();
                if (selectedRow >= 0) {
                    System.out.println("Selected row: " + selectedRow); // Debug output
                    if (controller != null) {
                        controller.displayUserInfo(selectedRow);
                        deleteUserButton.setVisible(true); // Show delete button
                    }
                } else {
                    deleteUserButton.setVisible(false); // Hide delete button
                }
            }
        });

        // Set delete button listener
        deleteUserButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                int selectedRow = userTable.getSelectedRow();
                if (selectedRow >= 0 && controller != null) {
                    int confirmation = JOptionPane.showConfirmDialog(AdminDashboard.this,
                            "Are you sure you want to delete this user?",
                            "Confirm Delete",
                            JOptionPane.YES_NO_OPTION);

                    if (confirmation == JOptionPane.YES_OPTION) {
                        controller.deleteUser(selectedRow);
                        deleteUserButton.setVisible(false); // Hide delete button after deleting user
                    }
                }
            }
        });

        // Display JFrame
        setVisible(true);
    }

    public void setTableModel(UserTableModel userTableModel) {
        userTable.setModel(userTableModel);
    }

    public void setUserInfo(String username, ImageIcon icon) {
        usernameLabel.setText(username);
        iconLabel.setIcon(icon);
        System.out.println("Username: " + username);
        System.out.println("Icon: " + icon);
    }

    public LoginPanel getLoginPanel() {
        return loginPanel;
    }

    public JTable getUserTable() {
        return userTable;
    }
    //Update UI according to state
    @Override
    public void onLoginStateChanged(boolean isLoggedIn, String username) {
        if (isLoggedIn) {
            getUserTable().setVisible(true);
            JOptionPane.showMessageDialog(this, "Login successful!");
            controller.loadUsers();
            loginPanel.setButtonState(false, true, !"admin".equals(username));
        } else {
            clearUserTable();
            loginPanel.setButtonState(true, false, false);
            loginPanel.clearFields();
        }
    }
    public void clearUserTable() {
        // Clear table data
        userTable.setModel(new DefaultTableModel()); // Clear the table
        userTable.setVisible(false); // Hide the table

        // Hide user info panel
        usernameLabel.setText(""); // Clear username
        iconLabel.setIcon(null);    // Clear icon

        // Hide delete button
        deleteUserButton.setVisible(false);
    }


}