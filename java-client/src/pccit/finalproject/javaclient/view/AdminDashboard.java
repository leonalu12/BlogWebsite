package pccit.finalproject.javaclient.view;

import javax.swing.*;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import pccit.finalproject.javaclient.controller.AdminController;
import pccit.finalproject.javaclient.model.UserTableModel;

public class AdminDashboard extends JFrame {
    private JTable userTable;
    private JLabel usernameLabel;
    private JLabel iconLabel;
    private LoginPanel loginPanel;
    private AdminController controller;

    public AdminDashboard() {
        // 设置JFrame属性
        setTitle("Admin Dashboard");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // 创建并添加登录面板
        loginPanel = new LoginPanel();
        add(loginPanel, BorderLayout.NORTH);

        // 创建JTable
        userTable = new JTable();
        add(new JScrollPane(userTable), BorderLayout.CENTER);

        // 创建用户信息面板，并放置在表格下方
        JPanel userInfoPanel = new JPanel();
        userInfoPanel.setLayout(new BoxLayout(userInfoPanel, BoxLayout.Y_AXIS)); // 使用 BoxLayout，让组件纵向排列

        // 设置用户信息面板的尺寸，增加整体高度
        userInfoPanel.setPreferredSize(new Dimension(userInfoPanel.getWidth(), 150)); // 设置高度为150px，调整值以获得所需高度

        usernameLabel = new JLabel();
        iconLabel = new JLabel();

        // 设置组件居中显示
        usernameLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        iconLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // 将用户名和头像添加到面板中
        userInfoPanel.add(Box.createVerticalStrut(30)); // 增加顶部间距
        userInfoPanel.add(usernameLabel);
        userInfoPanel.add(Box.createVerticalStrut(10)); // 给头像和用户名之间添加间距
        userInfoPanel.add(iconLabel);
        userInfoPanel.add(Box.createVerticalStrut(30)); // 增加底部间距

        // 将用户信息面板添加到JFrame的SOUTH位置
        add(userInfoPanel, BorderLayout.SOUTH);

        // 初始化控制器
        controller = new AdminController(this);

        // 设置JTable选择监听器
        userTable.getSelectionModel().addListSelectionListener(new ListSelectionListener() {
            @Override
            public void valueChanged(ListSelectionEvent e) {
                int selectedRow = userTable.getSelectedRow();
                if (selectedRow >= 0) {
                    System.out.println("Selected row: " + selectedRow); // 调试输出
                    if (controller != null) {
                        controller.displayUserInfo(selectedRow);
                    }
                }
            }
        });

        // 显示JFrame
        setVisible(true);
    }

    public void setTableModel(UserTableModel userTableModel) {
        userTable.setModel(userTableModel);
    }

    public void setUserInfo(String username, ImageIcon icon) {
        usernameLabel.setText(username);
        iconLabel.setIcon(icon);
        System.out.println("Username: " + username); // 调试输出
        System.out.println("Icon: " + icon); // 调试输出

    }

    public void clearUserInfo() {
        usernameLabel.setText(""); // 清空用户名
        iconLabel.setIcon(null);    // 清空头像
    }

    public LoginPanel getLoginPanel() {
        return loginPanel;
    }

    public JTable getUserTable() {
        return userTable;
    }


    public void clearUserTable() {
        // 清空表格数据
        userTable.setModel(new DefaultTableModel()); // 清空表格
        userTable.setVisible(false); // 隐藏表格

        // 隐藏用户信息面板
        usernameLabel.setText(""); // 清空用户名
        iconLabel.setIcon(null);    // 清空头像
//        usernameLabel.setVisible(false); // 隐藏用户名标签
//        iconLabel.setVisible(false);    // 隐藏头像标签
    }


}
